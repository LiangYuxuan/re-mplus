// Based on https://github.com/WoW-Tools/SereniaBLPLib

/* eslint-disable no-bitwise */

type DXTFormat = 'DXT1' | 'DXT3' | 'DXT5';

interface DXT565Data {
    value: number,
    color: [number, number, number, number],
}

const unpack565 = (data: Uint8Array, offset: number): DXT565Data => {
    // Build packed value
    const value = data[offset] | (data[offset + 1] << 8);

    // Get components in the stored range
    const r = (value >> 11) & 0x1F;
    const g = (value >> 5) & 0x3F;
    const b = value & 0x1F;

    // Scale up to 8 Bit
    return {
        value,
        color: [
            (r << 3) | (r >> 2),
            (g << 2) | (g >> 4),
            (b << 3) | (b >> 2),
            0xFF,
        ],
    };
};

const decompressColor = (data: Uint8Array, offset: number, format: DXTFormat): Uint8Array => {
    // Unpack Endpoints
    const colorA = unpack565(data, offset);
    const colorB = unpack565(data, offset + 2);
    const isDXT1NoAlpha = format === 'DXT1' && colorA.value <= colorB.value;

    const codes = new Uint8Array(16);
    codes.set(colorA.color, 0);
    codes.set(colorB.color, 4);

    // Generate Midpoints
    for (let i = 0; i < 3; i += 1) {
        const c = codes[i];
        const d = codes[i + 4];

        if (isDXT1NoAlpha) {
            codes[i + 8] = (c + d) / 2;
            codes[i + 12] = 0;
        } else {
            codes[i + 8] = (2 * c + d) / 3;
            codes[i + 12] = (c + 2 * d) / 3;
        }
    }

    // Fill in alpha for intermediate values
    codes[8 + 3] = 0xFF;
    codes[12 + 3] = isDXT1NoAlpha ? 0 : 0xFF;

    // Unpack the indices
    const indices = new Uint8Array(16);
    for (let i = 0; i < 4; i += 1) {
        const packed = data[offset + 4 + i];
        for (let j = 0; j < 4; j += 1) {
            const index = (packed >> (j * 2)) & 0x03;
            indices[i * 4 + j] = index;
        }
    }

    // Store out the colors
    const colors = new Uint8Array(4 * 16);
    for (let i = 0; i < 16; i += 1) {
        const index = indices[i] * 4;

        colors[i * 4 + 0] = codes[index + 0];
        colors[i * 4 + 1] = codes[index + 1];
        colors[i * 4 + 2] = codes[index + 2];
        colors[i * 4 + 3] = codes[index + 3];
    }

    return colors;
};

const decompressAlphaDXT3 = (colors: Uint8Array, data: Uint8Array, offset: number): Uint8Array => {
    const result = colors;

    // Unpack the alpha values pairwise
    for (let i = 0; i < 8; i += 1) {
        // Quantise down to 4 bits
        const quant = data[offset + i];

        const lo = quant & 0x0F;
        const hi = quant & 0xF0;

        // Convert back up to bytes
        result[i * 8 + 3] = lo | (lo << 4);
        result[i * 8 + 7] = hi | (hi >> 4);
    }

    return result;
};

const decompressAlphaDXT5 = (colors: Uint8Array, data: Uint8Array, offset: number): Uint8Array => {
    const result = colors;

    // Get the two alpha values
    const alpha0 = data[offset];
    const alpha1 = data[offset + 1];

    // Compare the values to build the codebook
    const codes = new Uint8Array(8);
    codes[0] = alpha0;
    codes[1] = alpha1;

    if (alpha0 <= alpha1) {
        // Use 5-Alpha Codebook
        for (let i = 1; i < 5; i += 1) {
            codes[i + 1] = ((5 - i) * alpha0 + i * alpha1) / 5;
        }
        codes[6] = 0;
        codes[7] = 0xFF;
    } else {
        // Use 7-Alpha Codebook
        for (let i = 1; i < 7; i += 1) {
            codes[i + 1] = ((7 - i) * alpha0 + i * alpha1) / 7;
        }
    }

    // Decode indices
    const indices = new Uint8Array(16);
    for (let i = 0; i < 2; i += 1) {
        // Grab 3 bytes
        const value = data[offset + 2 + i * 3]
            | (data[offset + 3 + i * 3] << 8)
            | (data[offset + 4 + i * 3] << 16);

        // Unpack 8 3-bit values from it
        for (let j = 0; j < 8; j += 1) {
            const code = (value >> (3 * j)) & 0x07;
            indices[i * 8 + j] = code;
        }
    }

    // Write out the indexed codebook values
    for (let i = 0; i < 16; i += 1) {
        result[i * 4 + 3] = codes[indices[i]];
    }

    return result;
};

const decompressBlock = (data: Uint8Array, offset: number, format: DXTFormat): Uint8Array => {
    // Get the block locations
    const colorBlockOffset = offset + (format === 'DXT1' ? 0 : 8);

    // Decompress color
    const colors = decompressColor(data, colorBlockOffset, format);

    // Decompress alpha separately if necessary
    switch (format) {
        case 'DXT1':
            return colors;
        case 'DXT3':
            return decompressAlphaDXT3(colors, data, offset);
        case 'DXT5':
            return decompressAlphaDXT5(colors, data, offset);
        default:
            format satisfies never;
            throw new Error('Unreachable');
    }
};

const decompressImage = (
    data: Uint8Array,
    width: number,
    height: number,
    format: DXTFormat,
): Uint8Array => {
    const rgba = new Uint8Array(width * height * 4);

    // Initialise the block input
    const bytesPerBlock = format === 'DXT1' ? 8 : 16;

    // Loop over blocks
    let offset = 0;
    for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
            if (offset >= data.byteLength) {
                break;
            }

            // Decompress the block
            const block = decompressBlock(data, offset, format);

            // Write the decompressed pixels to the correct image locations
            for (let py = 0; py < 4; py += 1) {
                for (let px = 0; px < 4; px += 1) {
                    const sx = x + px;
                    const sy = y + py;

                    if (sx < width && sy < height) {
                        const i = (sy * width + sx) * 4;
                        const j = (py * 4 + px) * 4;

                        rgba[i + 0] = block[j + 0];
                        rgba[i + 1] = block[j + 1];
                        rgba[i + 2] = block[j + 2];
                        rgba[i + 3] = block[j + 3];
                    }
                }
            }

            offset += bytesPerBlock;
        }
    }

    return rgba;
};

export default decompressImage;

import assert from 'node:assert';

import decompressImage from './dxt.ts';

type RGBAColor = [number, number, number, number];

interface MipmapData {
    rgba: Uint8Array,
    width: number,
    height: number,
}

const BLP2_MAGIC = 0x424C5032;

export default class BLPReader {
    public readonly data: Uint8Array;

    public readonly colorEncoding: number;

    public readonly alphaSize: number;

    public readonly alphaEncoding: number;

    public readonly hasMipmaps: number;

    public readonly width: number;

    public readonly height: number;

    public readonly offsets: number[] = [];

    public readonly sizes: number[] = [];

    public readonly palette: RGBAColor[] = [];

    constructor(data: Uint8Array) {
        this.data = data;

        const view = new DataView(data.buffer);

        const magic = view.getUint32(0, false);
        assert(magic === BLP2_MAGIC, `Invalid BLP2 magic: ${magic.toString(16)}`);

        const version = view.getUint32(4, true);
        assert(version === 1, `Invalid BLP2 version: ${version.toString(16)}`);

        this.colorEncoding = view.getUint8(8);
        this.alphaSize = view.getUint8(9);
        this.alphaEncoding = view.getUint8(10);
        this.hasMipmaps = view.getUint8(11);

        this.width = view.getUint32(12, true);
        this.height = view.getUint32(16, true);

        for (let i = 20; i < 84; i += 4) {
            const offset = view.getUint32(i, true);
            this.offsets.push(offset);
        }

        for (let i = 84; i < 148; i += 4) {
            const size = view.getUint32(i, true);
            this.sizes.push(size);
        }

        if (this.colorEncoding === 1) {
            for (let i = 148; i < 276; i += 4) {
                const b = view.getUint8(i);
                const g = view.getUint8(i + 1);
                const r = view.getUint8(i + 2);
                const a = view.getUint8(i + 3);
                this.palette.push([
                    r,
                    g,
                    b,
                    a,
                ]);
            }
        }
    }

    public processMipmap(level: number): MipmapData {
        const scale = 2 ** level;
        const scaleWidth = this.width / scale;
        const scaleHeight = this.height / scale;

        const offset = this.offsets[level];
        const size = this.sizes[level];
        const data = this.data.subarray(offset, offset + size);

        switch (this.colorEncoding) {
            case 1: {
                const length = scaleWidth * scaleHeight;
                const rgba = new Uint8Array(length * 4);

                for (let i = 0; i < length; i += 1) {
                    const [
                        r,
                        g,
                        b,
                    ] = this.palette[data[i]];
                    const j = i * 4;

                    rgba[j + 0] = r;
                    rgba[j + 1] = g;
                    rgba[j + 2] = b;

                    switch (this.alphaSize) {
                        case 1: {
                            const byte = data[length + (i / 8)];
                            // eslint-disable-next-line no-bitwise
                            const raw = byte & (0x01 << (i % 8));
                            rgba[j + 3] = raw ? 0xFF : 0x00;
                            break;
                        }
                        case 4: {
                            const byte = data[length + (i / 2)];
                            // eslint-disable-next-line no-bitwise
                            const raw = byte & (0x0F << ((i % 2) * 4));
                            rgba[j + 3] = raw;
                            break;
                        }
                        case 8: {
                            rgba[j + 3] = data[length + i];
                            break;
                        }
                        default: {
                            rgba[j + 3] = 0xFF;
                        }
                    }
                }

                return { rgba, width: scaleWidth, height: scaleHeight };
            }
            case 2: {
                const rgba = decompressImage(
                    data,
                    scaleWidth,
                    scaleHeight,
                    // eslint-disable-next-line no-nested-ternary
                    this.alphaSize <= 1 ? 'DXT1' : (this.alphaEncoding === 7 ? 'DXT5' : 'DXT3'),
                );
                return { rgba, width: scaleWidth, height: scaleHeight };
            }
            case 3: {
                const rgba = new Uint8Array(scaleWidth * scaleHeight * 4);

                for (let i = 0; i < data.length; i += 4) {
                    rgba[i + 0] = data[i + 2];
                    rgba[i + 1] = data[i + 1];
                    rgba[i + 2] = data[i + 0];
                    rgba[i + 3] = data[i + 3];
                }

                return { rgba, width: scaleWidth, height: scaleHeight };
            }
            default: {
                throw new Error(`Unknown color encoding: ${this.colorEncoding.toString()}`);
            }
        }
    }
}

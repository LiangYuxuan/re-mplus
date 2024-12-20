import dungeons from '../../data/generated/dungeons.json' with { type: 'json' };
import specializations from '../../data/generated/specializations.json' with { type: 'json' };

import type { LocaleData } from './type.ts';

export default {
    language: 'zh-CN',
    strings: new Map([
        ['title', '史诗钥石排行榜'],
        ['based-on-dungeon-best-run', '基于地下城最佳记录'],
        ['based-on-character-best-record', '基于角色最佳记录'],
        ['button-refresh', '刷新'],
        ['button-switch', '切换数据来源'],
        ['button-toggle-description', '显示/隐藏描述文本'],
        ['button-toggle-details', '显示/隐藏详细数据'],
        ['button-toggle-emoji', '这下看懂了'],
        ['current-season', '当前赛季'],
        ['missing-character-best-record', '由于 Raider.IO 未提供专精排行榜数据，角色最佳记录不可用。'],
        ['dungeon', '地下城'],
        ['tank', '坦克'],
        ['healer', '治疗'],
        ['melee', '近战'],
        ['ranged', '远程'],
        ['expansion', '资料片'],
        ['season', '赛季'],
        ['config-max-page', '配置：最大页数'],
        ['config-min-level', '配置：最低层数'],
        ['config-min-score', '配置：最低分数'],
        ['dungeon-min-level', '地下城最低层数'],
        ['character-min-score', '角色最低分数'],
        ['name', '名称'],
        ['tier', '等级'],
        ['n', '样本数'],
        ['min', '最小'],
        ['max', '最高'],
        ['mean', '平均数'],
        ['sd', '标准差'],
        ['ci', '置信下限'],
    ]),
    specializationsShortName: new Map([
        [62, '奥法'],
        [63, '火法'],
        [64, '冰法'],
        [65, '奶骑'],
        [66, '防骑'],
        [70, '惩戒'],
        [71, '武器'],
        [72, '狂暴'],
        [73, '防战'],
        [102, '鸟德'],
        [103, '猫德'],
        [104, '熊德'],
        [105, '奶德'],
        [250, '鲜血'],
        [251, '冰霜'],
        [252, '邪恶'],
        [253, '兽王'],
        [254, '射击'],
        [255, '生存'],
        [256, '戒律'],
        [257, '神牧'],
        [258, '暗牧'],
        [259, '刺杀'],
        [260, '狂徒'],
        [261, '敏锐'],
        [262, '元素'],
        [263, '增强'],
        [264, '奶萨'],
        [265, '痛苦'],
        [266, '恶魔'],
        [267, '毁灭'],
        [268, '酒仙'],
        [269, '踏风'],
        [270, '奶僧'],
        [577, '浩劫'],
        [581, '复仇'],
        [1467, '湮灭'],
        [1468, '奶龙'],
        [1473, '增辉'],
    ]),
    dungeonsShortName: new Map([
        [2, '青龙寺'],
        [56, '风暴烈酒酿造厂'], // 未决定
        [57, '残阳关'], // 未决定
        [58, '影踪禅院'], // 未决定
        [59, '围攻砮皂寺'], // 未决定
        [60, '魔古山宫殿'], // 未决定
        [76, '通灵学院'], // 未决定
        [77, '血色大厅'], // 未决定
        [78, '血色修道院'], // 未决定
        [161, '通天峰'], // 未决定
        [163, '血槌炉渣矿井'], // 未决定
        [164, '奥金顿'], // 未决定
        [165, '影月'],
        [166, '车站'],
        [167, '黑石塔上层'], // 未决定
        [168, '永茂'],
        [169, '码头'],
        [197, '艾萨拉'],
        [198, '黑心'],
        [199, '黑鸦'],
        [200, '英灵殿'],
        [206, '巢穴'],
        [207, '地窟'],
        [208, '噬魂'],
        [209, '回廊'],
        [210, '群星'],
        [227, '卡下'],
        [233, '大教堂'],
        [234, '卡上'],
        [239, '执政团'],
        [244, '阿塔'],
        [245, '自由镇'],
        [246, '托尔'],
        [247, '暴富'],
        [248, '庄园'],
        [249, '诸王'],
        [250, '神庙'],
        [251, '孢林'],
        [252, '风暴'],
        [353, '围攻'],
        [369, '垃圾场'],
        [370, '车间'],
        [375, '仙林'],
        [376, '通灵'],
        [377, '彼界'],
        [378, '赎罪'],
        [379, '凋魂'],
        [380, '赤红'],
        [381, '高塔'],
        [382, '剧场'],
        [391, '天街'],
        [392, '宏图'],
        [399, '红玉'],
        [400, '阻击战'],
        [401, '魔馆'],
        [402, '学院'],
        [403, '奥达曼'],
        [404, '奈萨'],
        [405, '蕨皮'],
        [406, '注能'],
        [438, '旋云'],
        [456, '潮汐'],
        [463, '陨落'],
        [464, '崛起'],
        [499, '隐修院'],
        [500, '栖巢'],
        [501, '宝库'],
        [502, '千丝'],
        [503, '回响'],
        [504, '暗焰'],
        [505, '破晨号'],
        [506, '酒庄'],
        [507, '格瑞'],
    ]),
    specializations: new Map(specializations.map(({ id, cn }) => [id, cn] as const)),
    dungeons: new Map(dungeons.map(({ id, cn }) => [id, cn] as const)),
    seasons: new Map([
        ['season-tww-1', '地心之战 第一赛季'],
        ['season-df-4-cutoffs', '巨龙时代 第四赛季'],
        ['season-df-3', '巨龙时代 第三赛季'],
        ['season-df-2', '巨龙时代 第二赛季'],
        ['season-df-1', '巨龙时代 第一赛季'],
        ['season-sl-4', '暗影国度 第四赛季'],
        ['season-sl-3', '暗影国度 第三赛季'],
        ['season-sl-2', '暗影国度 第二赛季'],
        ['season-sl-1', '暗影国度 第一赛季'],
        ['season-bfa-4', '争霸艾泽拉斯 第四赛季'],
        ['season-bfa-3', '争霸艾泽拉斯 第三赛季'],
        ['season-bfa-2', '争霸艾泽拉斯 第二赛季'],
        ['season-bfa-1', '争霸艾泽拉斯 第一赛季'],
    ]),
} satisfies LocaleData;

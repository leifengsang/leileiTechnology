/**
 * 绝妖星乱舞
 */

/**
 * 是否标记
 * @param {*} data 
 * @param {*} output 
 * @returns 
 */
function isMarkEnable(data, output) {
    return data.triggerSetConfig.globalMarkEnable && (!output.hasOwnProperty("是否标记") || output.是否标记().toLowerCase() === "true");
}

const headMarker = {
    P2_STACK: "02CB", //分摊
    P2_CIRCLE: "02CC", //大圈
    P2_SECTOR: "02CD", //扇形
}

/**
 * 战斗阶段
 */
const PHASE_KEFKA = 1; //p1
const PHASE_FORSAKEN_KEFKA = 2; //p2

const firstDecimalMarker = parseInt("00DA", 16);
const getHeadmarkerId = (data, matches) => {
    if (data.leileiDecOffset === undefined) data.leileiDecOffset = parseInt(matches.id, 16) - firstDecimalMarker;
    return (parseInt(matches.id, 16) - data.leileiDecOffset).toString(16).toUpperCase().padStart(4, "0");
};

Options.Triggers.push({
    zoneId: ZoneId.DancingMadUltimate,
    id: "leilei dancing mad ultimate",
    initData: () => {
        return {
            phase: 0,
            p2_spellsTroubleCountDic: {},
        }
    },
    config: [],
    triggers: [
        {
            id: "leilei DMU Headmarker Tracker",
            netRegex: NetRegexes.headMarker({}),
            condition: (data) => undefined === data.leileiDecOffset,
            run: (data, matches) => {
                getHeadmarkerId(data, matches);
            },
        },
        {
            id: "leilei DMU Headmarker debuger",
            netRegex: NetRegexes.headMarker({}),
            run: (data, matches) => {
                const id = getHeadmarkerId(data, matches);
                console.log("DMU headmarker:" + id, "originalId:" + matches.id, "firstDecimalMarker:", firstDecimalMarker.toString(16).toUpperCase().padStart(4, "0"));
            },
        },
        {
            id: "leilei DMU 控制战斗阶段",
            netRegex: NetRegexes.startsUsing({ id: ["BCF2", "BABC"] }),
            run: (data, matches) => {
                switch (matches.id) {
                    case "BCF2":
                        //众神之像
                        data.phase = PHASE_KEFKA;
                        break;
                    case "BABC":
                        //遗弃末世
                        data.phase = PHASE_FORSAKEN_KEFKA;
                        break;
                    default:
                        break;
                }
                console.log("phase", data.phase);
            }
        },
        {
            id: "leilei MDU p2 咏唱危机层数",
            netRegex: NetRegexes.gainsEffect({ effectId: "13DB" }),
            condition: (data, matches) => {
                return data.phase === PHASE_FORSAKEN_KEFKA;
            },
            run: (data, matches, output) => {
                data.p2_spellsTroubleCountDic[matches.target] = parseInt(matches.count);
            }
        },
        {
            id: "leilei MDU p2 遗弃末世头标提醒",
            netRegex: NetRegexes.headMarker({}),
            //1234会持续好多轮，先设置个60秒吧
            durationSeconds: 60,
            condition: (data, matches) => {
                if (data.phase !== PHASE_FORSAKEN_KEFKA) {
                    return false;
                }
                return matches.target === data.me;
            },
            infoText: (data, matches, output) => {
                const id = getHeadmarkerId(data, matches);
                if (id !== headMarker.P2_STACK && id !== headMarker.P2_CIRCLE && id !== headMarker.P2_SECTOR) {
                    return;
                }

                /**
                 * 可以写细点，根据data.p2_spellsTroubleCountDic获得对应的咏唱危机层数，提示对应轮次的走法
                 * 我们前排进度比较快，攻略随时改，这里只提醒最基础的内容
                 */
                if (id === headMarker.P2_STACK) {
                    return output.分摊();
                } else if (id === headMarker.P2_CIRCLE) {
                    return output.大圈();
                } else if (id === headMarker.P2_SECTOR) {
                    return output.扇形();
                }
            },
            outputStrings: {
                "分摊": "分摊分摊",
                "大圈": "大圈大圈",
                "扇形": "扇形扇形",
            }
        },
        {
            id: "leilei DMU p2 过去/未来终结",
            //"BAD2":未来终结, "BAD3":过去终结
            netRegex: NetRegexes.startsUsing({ id: ["BAD2", "BAD3"] }),
            //读条快结束时播报
            delaySeconds: 4,
            durationSeconds: 5,
            infoText: (data, matches, output) => {
                if (matches.id === "BAD2") {
                    return output.未来终结();
                } else if (matches.id === "BAD3") {
                    return output.过去终结();
                }
            },
            outputStrings: {
                "未来终结": "塔对侧引导",
                "过去终结": "塔同侧引导",
            }
        },
    ]
})
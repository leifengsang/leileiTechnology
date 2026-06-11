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

function getDist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

const headMarker = {
    KEFKA_FAKE: "02A1", //假分摊分散
    KEFKA_TRUE: "02A2", //真分摊分散
    KEFKA_CIRCLE: "007F", //P1&P4分散
    KEFKA_STACK: "0080", //P1&P4分摊
    P2_STACK: "02CB", //分摊
    P2_CIRCLE: "02CC", //大圈
    P2_SECTOR: "02CD", //扇形
}

const P3_STAGE1_BUFF_TYPE_SHORT = 1; //短buff
const P3_STAGE1_BUFF_TYPE_LONG = 2; //长buff

/**
 * 战斗阶段
 */
const PHASE_KEFKA = 1; //p1
const PHASE_FORSAKEN_KEFKA = 2; //p2
const PHASE_EXDEATH_AND_CHAOS = 3; //p3
const PHASE_KEFKA_SAYS = 4; //p4
const PHASE_ULTIMA_KEFKA = 5; //p5

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
            p2_spellsTroublePosDic: {},
            p2_headMarkerInfoList: [],
            p2_round: 0,
            p2_endCount: 0,
            p3_stage1_buffType: 0,
        }
    },
    config: [
        {
            id: "globalMarkEnable",
            comment: {
                cn: "需同时选择此处以及配置对应设置为true才能标记",
                en: "需同时选择此处以及配置对应设置为true才能标记",
                jp: "需同时选择此处以及配置对应设置为true才能标记",
            },
            name: {
                cn: "开启全局标记",
                en: "开启全局标记",
                jp: "开启全局标记",
            },
            type: "checkbox",
            default: false
        },
        {
            id: "p3_stage1",
            comment: {
                cn: "",
                en: "",
                jp: "",
            },
            name: {
                cn: "p3一运打法",
                en: "p3一运打法",
                jp: "p3一运打法",
            },
            options: {
                cn: {
                    "MMW（正攻）": "mmw",
                    "CCHH（TLB逃课）": "cchh",
                },
                en: {
                    "MMW（正攻）": "mmw",
                    "CCHH（TLB逃课）": "cchh",
                },
                jp: {
                    "MMW（正攻）": "mmw",
                    "CCHH（TLB逃课）": "cchh",
                },
            },
            type: "select",
            default: "cchh"
        },
    ],
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
            netRegex: NetRegexes.startsUsing({ id: ["BCF2", "BABC", "BAE2"] }),
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
                    case "BAE2":
                        //重构
                        data.phase = PHASE_EXDEATH_AND_CHAOS;
                        break;
                    default:
                        break;
                }
                console.log("phase", data.phase);
            }
        },
        {
            id: "leilei DMU 真假冰",
            //BA9E:假冰, BA98:真冰
            netRegex: NetRegexes.startsUsing({ id: ["BA9E", "BA98"] }),
            run: (data, matches) => {
                //TODO
            }
        },
        {
            id: "leilei DMU 真假雷",
            //BAA0:假雷, BA9F:真雷
            netRegex: NetRegexes.startsUsing({ id: ["BAA0", "BA9F"] }),
            run: (data, matches) => {
                //TODO
            }
        },
        /**
         * TODO
         * cast BA94:玄乎乎魔法
         * headMarker 007F 分散
         * headMarker 0080 分摊
         * headMarker 02A1 假
         * headMarker 02A2 真
         */
        {
            id: "leilei MDU p2 咏唱危机层数",
            netRegex: NetRegexes.gainsEffect({ effectId: "13DB" }),
            condition: (data) => {
                return data.phase === PHASE_FORSAKEN_KEFKA;
            },
            run: (data, matches, output) => {
                data.p2_spellsTroubleCountDic[matches.target] = parseInt(matches.count);
                data.p2_spellsTroublePosDic[matches.target] = { x: matches.x, y: matches.y };
            }
        },
        {
            id: "leilei MDU p2 咏唱危机层数 移除",
            netRegex: NetRegexes.losesEffect({ effectId: "13DB" }),
            condition: (data) => {
                return data.phase === PHASE_FORSAKEN_KEFKA;
            },
            run: (data, matches, output) => {
                data.p2_spellsTroubleCountDic[matches.target] = 0;
            }
        },
        {
            id: "leilei MDU p2 遗弃末世 轮次提醒",
            netRegex: NetRegexes.headMarker({}),
            suppressSeconds: 1,
            delaySeconds: 3,
            condition: (data, matches) => {
                if (data.phase !== PHASE_FORSAKEN_KEFKA) {
                    return false;
                }

                const id = getHeadmarkerId(data, matches);
                if (id !== headMarker.P2_STACK && id !== headMarker.P2_CIRCLE && id !== headMarker.P2_SECTOR) {
                    return false;
                }
                return true;
            },
            infoText: (data, matches, output) => {
                return output.content({ round: ++data.p2_round });
            },
            outputStrings: {
                content: "第${round}轮",
            }
        },
        {
            id: "leilei MDU p2 遗弃末世 轮次提醒 第八轮",
            netRegex: NetRegexes.headMarker({}),
            suppressSeconds: 1,
            delaySeconds: 13,
            condition: (data, matches) => {
                if (data.phase !== PHASE_FORSAKEN_KEFKA) {
                    return false;
                }

                const id = getHeadmarkerId(data, matches);
                if (id !== headMarker.P2_STACK && id !== headMarker.P2_CIRCLE && id !== headMarker.P2_SECTOR) {
                    return false;
                }
                return true;
            },
            infoText: (data, matches, output) => {
                if (data.p2_round === 7) {
                    return output.content({ round: 8 });
                }
            },
            outputStrings: {
                content: "第${round}轮",
            }
        },
        {
            id: "leilei MDU p2 遗弃末世 头标提醒",
            netRegex: NetRegexes.headMarker({}),
            //1234会持续好多轮，先设置个60秒吧
            durationSeconds: 60,
            condition: (data) => {
                if (data.phase !== PHASE_FORSAKEN_KEFKA) {
                    return false;
                }
                return true;
            },
            alertText: (data, matches, output) => {
                if (matches.target !== data.me) {
                    return;
                }

                const id = getHeadmarkerId(data, matches);
                if (id !== headMarker.P2_STACK && id !== headMarker.P2_CIRCLE && id !== headMarker.P2_SECTOR) {
                    return;
                }

                //轮次
                const buffRound = 4 - data.p2_spellsTroubleCountDic[data.me] + 1;

                /**
                 * 可以写细点，根据data.p2_spellsTroubleCountDic获得对应的咏唱危机层数，提示对应轮次的走法
                 * 我们前排进度比较快，攻略随时改，这里只提醒最基础的内容
                 */
                let content = "";
                if (id === headMarker.P2_STACK) {
                    content = output.分摊();
                } else if (id === headMarker.P2_CIRCLE) {
                    content = output.大圈();
                } else if (id === headMarker.P2_SECTOR) {
                    content = output.扇形();
                }
                return content + "(" + buffRound + ")";
            },
            outputStrings: {
                "分摊": "分摊",
                "大圈": "大圈",
                "扇形": "扇形",
            }
        },
        {
            id: "leilei MDU p2 遗弃末世 塔内最近头标播报",
            netRegex: NetRegexes.headMarker({}),
            //暂时不知道如何获得队友坐标，pass
            disabled: true,
            condition: (data) => {
                if (data.phase !== PHASE_FORSAKEN_KEFKA) {
                    return false;
                }
                return true;
            },
            run: (data, matches) => {
                const id = getHeadmarkerId(data, matches);
                if (id !== headMarker.P2_STACK && id !== headMarker.P2_CIRCLE && id !== headMarker.P2_SECTOR) {
                    return;
                }

                //轮次
                const buffRound = 4 - data.p2_spellsTroubleCountDic[data.me] + 1;
                if (buffRound === 4) {
                    //初始赋予8人buff
                    return;
                }

                //统计踩塔四人组buff变化
                if (data.p2_headMarkerInfoList.length == 4) {
                    //新的一轮，清空数据
                    data.p2_headMarkerInfoList = [];
                }
                //记录头标
                data.p2_headMarkerInfoList.push({
                    target: matches.target,
                    headMarker: id,
                    x: data.p2_spellsTroublePosDic[matches.target]?.x,
                    y: data.p2_spellsTroublePosDic[matches.target]?.y
                });
            },
            infoText: (data, matches, output) => {
                const id = getHeadmarkerId(data, matches);
                if (id !== headMarker.P2_STACK && id !== headMarker.P2_CIRCLE && id !== headMarker.P2_SECTOR) {
                    return;
                }

                if (data.p2_headMarkerInfoList.length == 4) {
                    const myHeadMarkerInfo = data.p2_headMarkerInfoList.find((v) => v.target === data.me);
                    if (!myHeadMarkerInfo) {
                        //自己是闲人，不需要播报最近
                        return;
                    }

                    //数据齐了，应该可以通过坐标找到同组另外一个人
                    const nearestHeadMarkerInfo = data.p2_headMarkerInfoList.map((v) => {
                        if (v.target === data.me) {
                            return 99999999;
                        }

                        return getDist(myHeadMarkerInfo.x, myHeadMarkerInfo.y, v.x, v.y);
                    }).sort((a, b) => a < b ? -1 : 1)[0];

                    let headMarkerName = "";
                    if (nearestHeadMarkerInfo.headMarker === headMarker.P2_STACK) {
                        headMarkerName = output.分摊();
                    } else if (nearestHeadMarkerInfo.headMarker === headMarker.P2_CIRCLE) {
                        headMarkerName = output.大圈();
                    } else if (nearestHeadMarkerInfo.headMarker === headMarker.P2_SECTOR) {
                        headMarkerName = output.扇形();
                    }

                    return output.content({ headMarker: headMarkerName, name: nearestHeadMarkerInfo.target });
                }

                return;
            },
            outputStrings: {
                "content": "同组：${headMarker}(${name})",
                "分摊": "分摊",
                "大圈": "大圈",
                "扇形": "扇形",
            }
        },
        {
            id: "leilei DMU p2 过去/未来终结",
            //"BAD2":未来终结, "BAD3":过去终结
            netRegex: NetRegexes.startsUsing({ id: ["BAD2", "BAD3"] }),
            //读条快结束时播报
            delaySeconds: 3,
            durationSeconds: 10,
            preRun: (data) => {
                data.p2_endCount++;
            },
            infoText: (data, matches, output) => {
                if (data.p2_endCount < 4) {
                    if (matches.id === "BAD2") {
                        return output.未来终结();
                    } else if (matches.id === "BAD3") {
                        return output.过去终结();
                    }
                } else {
                    //第四轮直接播报原地/穿
                    if (matches.id === "BAD2") {
                        return output.第四轮未来终结();
                    } else if (matches.id === "BAD3") {
                        return output.第四轮过去终结();
                    }
                }
            },
            outputStrings: {
                "未来终结": "塔对侧引导",
                "过去终结": "塔同侧引导",
                "第四轮未来终结": "穿过boss",
                "第四轮过去终结": "原地不动",
            }
        },
        {
            id: "leilei DMU p3 经/纬度聚爆",
            //"BAFD":经度聚爆, "BAFE":纬度聚爆
            netRegex: NetRegexes.startsUsing({ id: ["BAFD", "BAFE"] }),
            infoText: (data, matches, output) => {
                if (matches.id === "BAFD") {
                    return output.经度聚爆();
                } else if (matches.id === "BAFE") {
                    return output.纬度聚爆();
                }
            },
            outputStrings: {
                "经度聚爆": "去左右",
                "纬度聚爆": "去前后",
            }
        },
        {
            id: "leilei DMU p3 混沌之水 第一轮",
            netRegex: NetRegexes.gainsEffect({ effectId: "641" }),
            condition: (data, matches) => {
                return data.triggerSetConfig.p3_stage1 === "mmw" && matches.target === data.me;
            },
            infoText: (data, matches, output) => {
                const duration = parseInt(matches.duration);
                if (duration == 19) {
                    //短水
                    return output.短水();
                } else {
                    return output.长水();
                }
            },
            outputStrings: {
                "短水": "去水水晶就位",
                "长水": "去火水晶远离火"
            }
        },
        {
            id: "leilei DMU p3 混沌之炎 第一轮",
            netRegex: NetRegexes.gainsEffect({ effectId: "640" }),
            condition: (data, matches) => {
                return data.triggerSetConfig.p3_stage1 === "mmw" && matches.target === data.me;
            },
            infoText: (data, matches, output) => {
                const duration = parseInt(matches.duration);
                if (duration == 19) {
                    //短火
                    return output.短火();
                } else {
                    return output.长火();
                }
            },
            outputStrings: {
                "短火": "去火水晶就位",
                "长火": "去水水晶靠近水"
            }
        },
        {
            id: "leilei DMU p3 混沌之水 第二轮",
            netRegex: NetRegexes.gainsEffect({ effectId: "641" }),
            condition: (data, matches) => {
                return data.triggerSetConfig.p3_stage1 === "mmw" && matches.target === data.me;
            },
            delaySeconds: 41,
            infoText: (data, matches, output) => {
                const duration = parseInt(matches.duration);
                if (duration == 19) {
                    //短水
                    return output.短水();
                } else {
                    return output.长水();
                }
            },
            outputStrings: {
                "短水": "去火水晶远离火",
                "长水": "去水水晶就位"
            }
        },
        {
            id: "leilei DMU p3 混沌之炎 第二轮",
            netRegex: NetRegexes.gainsEffect({ effectId: "640" }),
            condition: (data, matches) => {
                return data.triggerSetConfig.p3_stage1 === "mmw" && matches.target === data.me;
            },
            delaySeconds: 41,
            infoText: (data, matches, output) => {
                const duration = parseInt(matches.duration);
                if (duration == 19) {
                    //短火
                    return output.短火();
                } else {
                    return output.长火();
                }
            },
            outputStrings: {
                "短火": "去水水晶靠近水",
                "长火": "去火水晶就位"
            }
        },
        {
            id: "leilei DMU p3 混沌buff类型",
            netRegex: NetRegexes.gainsEffect({ effectId: ["640", "641"] }),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            data: (data, matches) => {
                const duration = parseInt(matches.duration);
                data.p3_stage1_buffType = duration === 19 ? P3_STAGE1_BUFF_TYPE_SHORT : P3_STAGE1_BUFF_TYPE_LONG;
            },
        },
        {
            id: "leilei DMU p3 混沌之风/逆风",
            //642:风(背对), 643:逆风(正对)
            netRegex: NetRegexes.gainsEffect({ effectId: ["642", "643"] }),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: (data, matches) => {
                if (data.triggerSetConfig.p3_stage1 === "mmw" && data.p3_stage1_buffType === P3_STAGE1_BUFF_TYPE_SHORT) {
                    return 44;
                } else if (data.triggerSetConfig.p3_stage1 === "mmw" && data.p3_stage1_buffType === P3_STAGE1_BUFF_TYPE_LONG) {
                    return 17;
                } else {
                    return 56;
                }
            },
            infoText: (data, matches, output) => {
                if (matches.effectId === "642") {
                    return output.背对();
                } else {
                    return output.正对();
                }
            },
            outputStrings: {
                正对: "正对击退",
                背对: "背对击退"
            }
        },
        {
            id: "leilei DMU p3 响亮亮耳光",
            //"BAE6":右侧安全, "BAE7":左侧安全
            netRegex: NetRegexes.startsUsing({ id: ["BAE6", "BAE7"] }),
            infoText: (data, matches, output) => {
                if (matches.id === "BAE6") {
                    return output.右侧安全();
                } else {
                    return output.左侧安全();
                }
            },
            outputStrings: {
                "左侧安全": "去左边职能刀",
                "右侧安全": "去右边分摊",
            }
        },
        {
            id: "leilei DMU p3 诅咒敕令",
            netRegex: NetRegexes.startsUsing({ id: "BB01" }),
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "去卡奥斯背后"
            }
        },
        /**
         * TODO
         * BBC 1号
         * BBD 2号
         * BBE 3号
         */
        {
            id: "leilei MDU p3 二运麻将1号 黑洞1-1",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBC" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 19,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "攻击一接线"
            }
        },
        {
            id: "leilei MDU p3 二运麻将1号 黑洞1-2",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBC" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 24,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "攻击一二接线"
            }
        },
        {
            id: "leilei MDU p3 二运麻将1号 黑洞2-1",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBC" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 49,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "攻击一二三接线"
            }
        },
        {
            id: "leilei MDU p3 二运麻将1号 黑洞2-2",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBC" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 54,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "攻击一回人群"
            }
        },
        {
            id: "leilei MDU p3 二运麻将1号 黑洞2-3",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBC" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 59,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "攻击二回人群"
            }
        },
        {
            id: "leilei MDU p3 二运麻将2号 黑洞2-2",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBD" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 54,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "锁链一接攻击一"
            }
        },
        {
            id: "leilei MDU p3 二运麻将2号 黑洞2-3",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBD" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 59,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "锁链二接攻击二"
            }
        },
        {
            id: "leilei MDU p3 二运麻将2号 黑洞3-1",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBD" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 83,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "锁链一二三接线"
            }
        },
        {
            id: "leilei MDU p3 二运麻将2号 黑洞3-2",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBD" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 88,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "锁链一回人群"
            }
        },
        {
            id: "leilei MDU p3 二运麻将2号 黑洞3-3",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBD" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 95,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "锁链二回人群"
            }
        },
        {
            id: "leilei MDU p3 二运麻将3号 黑洞3-2",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBE" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 88,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "禁止一接锁链一"
            }
        },
        {
            id: "leilei MDU p3 二运麻将3号 黑洞3-3",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBE" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 95,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "禁止二接锁链二"
            }
        },
        {
            id: "leilei MDU p3 二运麻将3号 黑洞4-1",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBE" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 118,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "禁止一二接线"
            }
        },
        {
            id: "leilei MDU p3 二运麻将3号 黑洞4-2",
            netRegex: NetRegexes.gainsEffect({ effectId: "BBE" }),
            durationSeconds: 10,
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 125,
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "禁止二接两根线"
            }
        },
        {
            id: "leilei DMU p3 强化冰封",
            netRegex: NetRegexes.startsUsing({ id: "BB11" }),
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                "content": "动动动"
            }
        },
    ]
})
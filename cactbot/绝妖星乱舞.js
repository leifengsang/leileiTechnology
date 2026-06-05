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
            p2_spellsTroublePosDic: {},
            p2_headMarkerInfoList: [],
            p2_round: 0,
            p2_endCount: 0,
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
            infoText: (data, matches, output) => {
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
            delaySeconds: 4,
            durationSeconds: 10,
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
    ]
})
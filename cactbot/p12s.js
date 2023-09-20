/**
 * p12s
 */

/**
 * 魂之刻印阶段
 */
const PHASE_DOUBLE_STACK = 2; //2分钟120后的左右分摊
const PHASE_BREAK_FLOOR = 3; //拆地板

Options.Triggers.push({
    zoneId: ZoneId.AnabaseiosTheTwelfthCircleSavage,
    // zoneRegex: /Anabaseios: The Twelfth Circle \(Savage\)/,
    initData: () => {
        return {
            soulPhase: 0,
            soulStackBuffCount: 0,
            breakFloorLightTower: false,
            breakFloorDpsAlerted: false,
            unstableFactorDic: {}, //key:playerId, value:count
            unstableFactorCount: 0,
            mahjongPhaseEntered: false,
            whiteFlameCount: 0,
            towerAlerted: false,
        }
    },
    triggers: [
        {
            id: "leilei p12s门神 死刑靠近远离",
            //82FE 人群靠近
            //82FF 人群远离
            netRegex: NetRegexes.startsUsing({ id: ["82FF", "82FE"] }),
            infoText: (data, matches, output) => {
                if (matches.id === "82FE") {
                    return output.人群靠近();
                } else {
                    return output.人群远离();
                }
            },
            outputStrings: {
                人群靠近: "人群靠近",
                人群远离: "人群远离"
            }
        },
        {
            id: "leilei p12s门神 魂之刻印",
            netRegex: NetRegexes.startsUsing({ id: "8305" }),
            run: (data) => {
                data.soulPhase++;
                console.log("soul phase", data.soulPhase);
            },
        },
        {
            id: "leilei p12s门神 第一次召唤 第二轮播报（左右分摊）",
            //DF8 光易伤
            //DF9 暗易伤
            //DFD 光射线
            //DFE 暗射线
            //DFB 光放塔
            //DFC 暗放塔
            //DFA 大圈
            netRegex: NetRegexes.gainsEffect({ effectId: ["DF8", "DF9", "DFD", "DFE", "DFB", "DFC"] }),
            condition: (data, matches) => {
                return data.soulPhase == PHASE_DOUBLE_STACK && data.soulStackBuffCount < 8;
            },
            delaySeconds: 5,
            infoText: (data, matches, output) => {
                data.soulStackBuffCount++;
                if (matches.target === data.me) {
                    const lightGroup = ["DF8", "DFE", "DFB"];
                    const darkGroup = ["DF9", "DFD", "DFC"];
                    if (lightGroup.includes(matches.effectId)) {
                        return output.光人群();
                    } else if (darkGroup.includes(matches.effectId)) {
                        return output.暗人群();
                    }
                }
            },
            outputStrings: {
                光人群: "去右边分摊",
                暗人群: "去左边分摊"
            }
        },
        {
            id: "leilei p12s门神 第一次召唤 第三轮播报（放圈、塔） 大圈",
            //DFA 大圈
            netRegex: NetRegexes.gainsEffect({ effectId: "DFA" }),
            condition: (data, matches) => {
                return data.soulPhase == PHASE_DOUBLE_STACK && matches.target === data.me;
            },
            delaySeconds: (data, matches) => {
                return matches.duration - 7;
            },
            infoText: (data, matches, output) => {
                return output.大圈();
            },
            outputStrings: {
                大圈: "去放圈"
            }
        },
        {
            id: "leilei p12s门神 第一次召唤 第三轮播报（放圈、塔） 放塔&踩塔",
            //DFD 光射线
            //DFE 暗射线
            //DFB 光放塔
            //DFC 暗放塔
            netRegex: NetRegexes.gainsEffect({ effectId: ["DFD", "DFE", "DFB", "DFC"] }),
            condition: (data, matches) => {
                return data.soulPhase == PHASE_DOUBLE_STACK && matches.target === data.me;
            },
            delaySeconds: 12,
            infoText: (data, matches, output) => {
                if (matches.effectId === "DFD") {
                    return output.光踩塔();
                } else if (matches.effectId === "DFE") {
                    return output.暗踩塔();
                } else if (matches.effectId === "DFB") {
                    return output.光放塔();
                } else if (matches.effectId === "DFC") {
                    return output.暗放塔();
                }
            },
            outputStrings: {
                光放塔: "去右边放塔",
                暗放塔: "去左边放塔",
                光踩塔: "去左边踩塔",
                暗踩塔: "去右边踩塔"
            }
        },
        {
            id: "leilei p12s门神 拆地板 放塔点名",
            //DFB 光放塔
            //DFC 暗放塔
            netRegex: NetRegexes.gainsEffect({ effectId: ["DFB", "DFC"] }),
            condition: (data, matches) => {
                return data.soulPhase == PHASE_BREAK_FLOOR;
            },
            suppressSeconds: 1,
            run: (data, matches) => {
                data.breakFloorLightTower = matches.effectId === "DFB";
            }
        },
        {
            id: "leilei p12s门神 拆地板 DPS踩塔&引导",
            //00EA 光连线
            //00E9 暗连线
            netRegex: NetRegexes.tether({}),
            delaySeconds: 5,
            condition: (data, matches) => {
                if (matches.id !== "00E9" && matches.id !== "00EA") {
                    return;
                }

                if (data.breakFloorDpsAlerted) {
                    return;
                }

                return data.soulPhase == PHASE_BREAK_FLOOR && matches.target === data.me;
            },
            infoText: (data, matches, output) => {
                data.breakFloorDpsAlerted = true;
                if (data.breakFloorLightTower != (matches.id === "00E9")) {
                    return output.踩塔();
                } else {
                    return output.引导();
                }
            },
            outputStrings: {
                踩塔: "准备踩塔",
                引导: "准备引导"
            }
        },
        {
            id: "leilei p12s门神 进入麻将阶段 播报第一轮冲击炮",
            //有成员收到伤害：アルテマブレイド
            netRegex: NetRegexes.ability({ id: "82F4" }),
            suppressSeconds: 1,
            delaySeconds: 16,
            preRun: (data, matches, output) => {
                data.mahjongPhaseEntered = true;
            },
            infoText: (data, matches, output) => {
                return output.第一轮引导();
            },
            outputStrings: {
                第一轮引导: "5号7号引导",
            }
        },
        {
            id: "leilei p12s门神 播报后三轮麻将冲击炮",
            netRegex: NetRegexes.ability({ id: "82EF" }),
            suppressSeconds: 1,
            condition: (data) => {
                return data.mahjongPhaseEntered;
            },
            preRun: (data, matches, output) => {
                data.whiteFlameCount++;
            },
            infoText: (data, matches, output) => {
                switch (data.whiteFlameCount) {
                    case 1:
                        return output.第二轮引导();
                    case 2:
                        return output.第三轮引导();
                    case 3:
                        return output.第四轮引导();
                    default:
                        return "";
                }
            },
            outputStrings: {
                第二轮引导: "6号8号引导",
                第三轮引导: "1号3号引导",
                第四轮引导: "2号4号引导",
            }
        },
        {
            id: "leilei p12s本体 踩塔运动会 闲/单buff分组标记",
            //E09 消层buff 分为1层和2层
            netRegex: NetRegexes.gainsEffect({ effectId: "E09" }),
            infoText: "",
            preRun: (data, matches) => {
                data.unstableFactorDic[matches.targetId] = parseInt(matches.count);
                data.unstableFactorCount++;

                if (data.unstableFactorCount == 6) {
                    let singleGroup = []; //单buff
                    let otherGroup = []; //闲buff
                    data.party.partyIds_.forEach((e) => {
                        if (data.unstableFactorDic[e] == 1) {
                            singleGroup.push(e);
                        } else if (!data.unstableFactorDic[e]) {
                            otherGroup.push(e);
                        }
                    });

                    data.singleGroup = singleGroup;
                    data.otherGroup = otherGroup;

                    //debug
                    singleGroup.forEach((e) => {
                        console.log("singleGroup", data.leileiFL.getJobNameByHexId(data, e));
                    });
                    otherGroup.forEach((e) => {
                        console.log("otherGroup", data.leileiFL.getJobNameByHexId(data, e));
                    });
                }
            },
            infoText: (data, matches, output) => {
                if (data.unstableFactorCount != 6) {
                    return;
                }


            },
            run: (data, matches, output) => {
                if (data.unstableFactorCount != 6) {
                    return;
                }

                if (output.是否标记() !== "true") {
                    return;
                }

                /**
                 * 闲buff 禁止12
                 * 黑白1层 锁链12
                 */
                const rpRuleList = output.优先级().split("/");
                data.singleGroup.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });
                data.otherGroup.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });

                //闲buff
                data.leileiFL.mark(data.otherGroup[0], data.leileiData.targetMarkers.stop1);
                data.leileiFL.mark(data.otherGroup[1], data.leileiData.targetMarkers.stop2);

                //黑白1层
                data.leileiFL.mark(data.singleGroup[0], data.leileiData.targetMarkers.bind1);
                data.leileiFL.mark(data.singleGroup[1], data.leileiData.targetMarkers.bind2);
            },
            outputStrings: {
                优先级: "MT/ST/H1/H2/D1/D2/D3/D4",
                是否标记: "false",
                同组职能: "${rp}"
            }
        },
        {
            id: "leilei p12s本体 踩塔运动会 闲/单buff播报",
            //E09 消层buff 分为1层和2层
            netRegex: NetRegexes.gainsEffect({ effectId: "E09" }),
            infoText: (data, matches, output) => {
                if (data.unstableFactorCount == 6) {
                    const selfId = data.leileiFL.getHexIdByName(data, data.me);
                    if (!data.unstableFactorDic[selfId]) {
                        data.towerAlerted = true;
                        return output.闲人提示();
                    } else if (data.unstableFactorDic[selfId] == 1) {
                        data.towerAlerted = true;
                        return output.单buff提示();
                    }
                }
            },
            outputStrings: {
                闲人提示: "去北边等塔",
                单buff提示: "去左右踩塔"
            }
        },
        {
            id: "leilei p12s本体 踩塔运动会 光暗长短播报",
            //DF8 光buff
            //DF9 暗buff
            netRegex: NetRegexes.gainsEffect({ effectId: ["DF8", "DF9"] }),
            condition: (data, matches) => {
                if (data.towerAlerted) {
                    return false;
                }

                if (matches.target !== data.me) {
                    return false;
                }

                const selfId = data.leileiFL.getHexIdByName(data, data.me);
                if (data.unstableFactorDic[selfId] != 2) {
                    return false;
                }

                return true;
            },
            infoText: (data, matches, output) => {
                data.towerAlerted = true;
                if (matches.effectId === "DF9") {
                    if (parseInt(matches.duration) == 20) {
                        return output.暗长();
                    } else {
                        return output.暗短();
                    }
                } else {
                    if (parseInt(matches.duration) == 20) {
                        return output.光长();
                    } else {
                        return output.光短();
                    }
                }
            },
            outputStrings: {
                光长: "去暗南边等塔",
                暗长: "去光南边等塔",
                光短: "去踩暗塔",
                暗短: "去踩光塔",
            }
        },
        {
            id: "leilei p12s本体 缩小分散播报",
            //8329 横排安全区
            //832B 竖排安全区
            //832A 环形安全区
            netRegex: NetRegexes.startsUsing({ id: ["8329", "832A", "832B"] }),
            infoText: (data, matches, output) => {
                console.log(matches.id);
                if (matches.id === "8329") {
                    return output.横排安全区();
                } else if (matches.id === "832B") {
                    return output.竖排安全区();
                } else if (matches.id === "832A") {
                    return output.环形安全区();
                }
            },
            outputStrings: {
                竖排安全区: "横向散开",
                横排安全区: "竖向散开",
                环形安全区: "月环散开",
            }
        },
    ]
})
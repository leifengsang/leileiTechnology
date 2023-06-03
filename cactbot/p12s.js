/**
 * p12s
 */

/**
 * 魂之刻印阶段
 */
const PHASE_DOUBLE_STACK = 2; //2分钟120后的左右分摊
const PHASE_BREAK_FLOOR = 3; //拆地板

Options.Triggers.push({
    // zoneId: ZoneId.AnabaseiosTheTwelfthCircleSavage,
    zoneRegex: /Anabaseios: The Twelfth Circle \(Savage\)/,
    initData: () => {
        return {
            soulPhase: 0,
            soulStackBuffCount: 0,
            breakFloorLightTower: false,
            breakFloorDpsAlerted: false,
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
                return matches.duration - 5;
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
            delaySeconds: 14,
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
    ]
})
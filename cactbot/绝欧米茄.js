/**
 * 绝欧米茄
 */

const MAHJONG_PHASE_P1_1 = 1; //P1 拉线踩塔
const MAHJONG_PHASE_P1_2 = 2; //P1 全能之主

Options.Triggers.push({
    zoneId: ZoneId.TheOmegaProtocolUltimate,
    initData: () => {
        return {
            mahjongPhase: 0,
            p1_2_mahjongGroupDic: { 1: [], 2: [], 3: [], 4: [] },
            p1_2_mahjongCount: 0,
            p1_2_myMahjongGroup: 0,
        }
    },
    triggers: [
        {
            id: "leilei p1 循环编译",
            netRegex: NetRegexes.startsUsing({ id: "7B03" }),
            run: (data) => {
                data.mahjongPhase++;
            }
        },
        {
            id: "leilei p1 拉线",
            //BBC 1号
            //BBD 2号
            //BBE 3号
            //D7B 4号
            netRegex: NetRegexes.gainsEffect({ effectId: ["BBC", "BBD", "BBE", "D7B"] }),
            condition: (data, matches) => {
                return data.mahjongPhase === MAHJONG_PHASE_P1_1 && matches.target === data.me;
            },
            delaySeconds: (data, matches) => {
                let delay = 0;
                //拉线顺序：3-4-1-2
                switch (matches.effectId) {
                    case "BBE":
                        delay = 0;
                        break;
                    case "D7B":
                        delay = 14;
                        break;
                    case "BBC":
                        delay = 23;
                        break;
                    case "BBD":
                        delay = 32;
                        break;
                    default:
                        break;
                }
                return delay;
            },
            tts: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                content: "去拉线"
            }
        },
        {
            id: "leilei p1 踩塔",
            //BBC 1号
            //BBD 2号
            //BBE 3号
            //D7B 4号
            netRegex: NetRegexes.gainsEffect({ effectId: ["BBC", "BBD", "BBE", "D7B"] }),
            condition: (data, matches) => {
                return data.mahjongPhase === MAHJONG_PHASE_P1_1 && matches.target === data.me;
            },
            delaySeconds: (data, matches) => {
                let delay = 0;
                //踩塔顺序：1-2-3-4
                switch (matches.effectId) {
                    case "BBC":
                        delay = 0;
                        break;
                    case "BBD":
                        delay = 14;
                        break;
                    case "BBE":
                        delay = 23;
                        break;
                    case "D7B":
                        delay = 32;
                        break;
                    default:
                        break;
                }
                return delay;
            },
            tts: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                content: "去踩塔"
            }
        },
        {
            id: "leilei p1 全能之主",
            netRegex: NetRegexes.startsUsing({ id: "7B0B" }),
            run: (data) => {
                data.mahjongPhase++;
            }
        },
        {
            id: "leilei p1 诱导导弹P",
            netRegex: NetRegexes.gainsEffect({ effectId: ["D60", "DA7", "DA8", "DA9"] }),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: (data, matches) => {
                return matches.duration - 5;
            },
            tts: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                content: "出去放导弹"
            }
        },
        {
            id: "leilei p1 全能之主分组",
            //BBC 1号
            //BBD 2号
            //BBE 3号
            //D7B 4号
            netRegex: NetRegexes.gainsEffect({ effectId: ["BBC", "BBD", "BBE", "D7B"] }),
            condition: (data, matches) => {
                return data.mahjongPhase === MAHJONG_PHASE_P1_2;
            },
            tts: (data, matches, output) => {
                data.p1_2_mahjongCount++;
                let mahjongGroup = 0;
                switch (matches.effectId) {
                    case "BBC":
                        mahjongGroup = 1;
                        break;
                    case "BBD":
                        mahjongGroup = 2;
                        break;
                    case "BBE":
                        mahjongGroup = 3;
                        break;
                    case "D7B":
                        mahjongGroup = 4;
                        break;
                    default:
                        break;
                }
                data.p1_2_mahjongGroupDic[mahjongGroup].push(matches.target);
                if (matches.target === data.me) {
                    data.p1_2_myMahjongGroup = mahjongGroup;
                }

                if (data.p1_2_mahjongCount != 8) {
                    return;
                }

                let list = data.p1_2_mahjongGroupDic[data.p1_2_myMahjongGroup];
                let targetName = list.find((v) => {
                    return v !== data.me;
                });

                return output.content({ rp: data.leileiFL.getRpByName(data, targetName) });
            },
            outputStrings: {
                content: "同组是${rp}"
            }
        },
    ]
})
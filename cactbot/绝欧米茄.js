/**
 * 绝欧米茄
 */

const MAHJONG_PHASE_P1_1 = 1; //P1 拉线踩塔
const MAHJONG_PHASE_P1_2 = 2; //P1 全能之主

const headMarker = {
    programPTCircle: "01A0",
    programPTTriangle: "01A1",
    programPTSquare: "01A2",
    programPTX: "01A3",
    programLBFlame: "015A", //P2二运核爆
}

const firstDecimalMarker = parseInt("0017", 16);
const getHeadmarkerId = (data, matches) => {
    if (!data.leileiDecOffset) data.leileiDecOffset = parseInt(matches.id, 16) - firstDecimalMarker;
    return (parseInt(matches.id, 16) - data.leileiDecOffset).toString(16).toUpperCase().padStart(4, "0");
};

Options.Triggers.push({
    zoneId: ZoneId.TheOmegaProtocolUltimate,
    initData: () => {
        return {
            mahjongPhase: 0,
            p1_2_mahjongGroupDic: { 1: [], 2: [], 3: [], 4: [] },
            p1_2_mahjongCount: 0,
            p1_2_myMahjongGroup: 0,
            p2_programPT_TTS_Dic: { "M": "", "F": "" },
            p2_programPT_markReverse: false,
            p2_programPT_markCount: 0,
            p2_programPT_markCleared: false,
            p2_programPT_groupDic: { "circle": [], "triangle": [], "square": [], "x": [] },
            p2_finalAnalysismarkCount: 0,
            p2_finalAnalysisGroupDic: { "stack": [], "spread": [] },
            p2_programLB_ignoreStackList: [],
            p3_helloWorldBuffCount: 0,
            p3_helloWorldBuffDic: { "red": [], "blue": [], "dna": [], "share": [], "circle": [] },
            p3_helloWorldCircleColor: "",
            p3_helloWorldShareColor: "",
        }
    },
    triggers: [
        {
            id: "leilei TOP p1 循环编译",
            netRegex: NetRegexes.startsUsing({ id: "7B03" }),
            run: (data) => {
                data.mahjongPhase++;
            }
        },
        {
            id: "leilei TOP p1 拉线",
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
            id: "leilei TOP p1 踩塔",
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
            id: "leilei TOP p1 全能之主",
            netRegex: NetRegexes.startsUsing({ id: "7B0B" }),
            run: (data) => {
                data.mahjongPhase++;
            }
        },
        {
            id: "leilei TOP p1 诱导导弹P",
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
            id: "leilei TOP p1 全能之主分组",
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

                const list = data.p1_2_mahjongGroupDic[data.p1_2_myMahjongGroup];
                const targetName = list.find((v) => {
                    return v !== data.me;
                });

                return output.content({ rp: data.leileiFL.getRpByName(data, targetName) });
            },
            outputStrings: {
                content: "麻将同组是${rp}"
            }
        },
        {
            id: "leilei TOP p2 一运男人读条",
            //7B25 月环
            //7B26 钢铁
            netRegex: NetRegexes.startsUsing({ id: ["7B25", "7B26"] }),
            tts: (data, matches, output) => {
                //一运后半有5个男人钢铁，不要干扰
                if (data.p2_programPT_TTS_Dic["M"] !== "") {
                    //干掉之前的标记
                    if (output.取消一运标记() === "true") {
                        if (!data.p2_programPT_markCleared) {
                            data.p2_programPT_markCleared = true;
                            data.leileiFL.clearMark();
                        }
                    }
                    return;
                }

                let content = "";
                if (matches.id === "7B25") {
                    content = output.月环();
                } else {
                    content = output.钢铁();
                }
                data.p2_programPT_TTS_Dic["M"] = content;

                if (data.p2_programPT_TTS_Dic["M"] === "" || data.p2_programPT_TTS_Dic["F"] === "") {
                    return;
                }
                return data.p2_programPT_TTS_Dic["M"] + data.p2_programPT_TTS_Dic["F"];
            },
            outputStrings: {
                钢铁: "远离",
                月环: "靠近",
                取消一运标记: "false"
            }
        },
        // {
        //     id: "leilei TOP p2 一运女人读条",
        //     //7B2A 辣翅
        //     //7B2D 辣尾
        //     netRegex: NetRegexes.startsUsing({ id: ["7B2A", "7B2D"] }),
        //     tts: (data, matches, output) => {
        //         let content = "";
        //         if (matches.id === "7B2A") {
        //             content = output.辣翅();
        //         } else {
        //             content = output.辣尾();
        //         }
        //         data.p2_programPT_TTS_Dic["F"] = content;

        //         if (data.p2_programPT_TTS_Dic["M"] === "" || data.p2_programPT_TTS_Dic["F"] === "") {
        //             return;
        //         }
        //         return data.p2_programPT_TTS_Dic["M"] + data.p2_programPT_TTS_Dic["F"];
        //     },
        //     outputStrings: {
        //         辣翅: "去中间",
        //         辣尾: "去两边"
        //     }
        // },
        {
            id: "leilei TOP Headmarker Tracker",
            netRegex: NetRegexes.headMarker({}),
            condition: (data) => undefined === data.leileiDecOffset,
            run: (data, matches) => {
                getHeadmarkerId(data, matches);
            },
        },
        {
            id: "leilei TOP p2 靠近远离",
            //D63 靠近
            //D64 远离
            netRegex: NetRegexes.gainsEffect({ effectId: ["D63", "D64"] }),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            run: (data, matches) => {
                data.p2_programPT_markReverse = matches.effectId === "D64";
            }
        },
        {
            id: "leilei TOP p2 一运击退分摊前远近线提醒",
            //D63 靠近
            //D64 远离
            netRegex: NetRegexes.gainsEffect({ effectId: ["D63", "D64"] }),
            condition: (data, matches) => {
                return matches.target === data.me;
            },
            delaySeconds: 15,
            tts: (data, matches, output) => {
                return matches.effectId === "D64" ? output.远线() : output.近线();
            },
            outputStrings: {
                远线: "远离远离",
                近线: "靠近靠近"
            }
        },
        {
            id: "leilei TOP p2 一运头顶标记",
            netRegex: NetRegexes.headMarker({}),
            run: (data, matches, output) => {
                if (output.是否标记() !== "true") {
                    return;
                }
                const id = getHeadmarkerId(data, matches);
                const headMarkers = [
                    headMarker.programPTCircle,
                    headMarker.programPTTriangle,
                    headMarker.programPTSquare,
                    headMarker.programPTX,
                ]
                if (!headMarkers.includes(id)) {
                    return;
                }

                let psType = "";
                switch (id) {
                    case headMarker.programPTCircle:
                        psType = "circle";
                        break;
                    case headMarker.programPTTriangle:
                        psType = "triangle";
                        break;
                    case headMarker.programPTSquare:
                        psType = "square";
                        break;
                    case headMarker.programPTX:
                        psType = "x";
                        break;
                    default:
                        break;
                }
                data.p2_programPT_groupDic[psType].push(data.leileiFL.getRpByHexId(data, matches.targetId));
                data.p2_programPT_markCount++;
                if (data.p2_programPT_markCount != 8) {
                    return;
                }

                //正序优先级：圆圈 叉 方块 三角
                const rpRuleList = output.优先级().split("/");
                for (const key in data.p2_programPT_groupDic) {
                    let list = data.p2_programPT_groupDic[key];
                    list.sort((a, b) => {
                        return rpRuleList.indexOf(a) - rpRuleList.indexOf(b);
                    })
                }

                const psRuleList = output.ps顺序().split("/");
                let highGroup = [
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[0]][0]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[1]][0]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[2]][0]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[3]][0]),
                ];
                let lowGroup = [
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[0]][1]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[1]][1]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[2]][1]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[3]][1]),
                ];
                if (data.p2_programPT_markReverse) {
                    lowGroup.reverse();
                }

                data.leileiFL.clearMark();
                data.leileiFL.mark(highGroup[0], data.leileiData.targetMakers.attack1);
                data.leileiFL.mark(highGroup[1], data.leileiData.targetMakers.attack2);
                data.leileiFL.mark(highGroup[2], data.leileiData.targetMakers.attack3);
                data.leileiFL.mark(highGroup[3], data.leileiData.targetMakers.attack4);

                data.leileiFL.mark(lowGroup[0], data.leileiData.targetMakers.bind1);
                data.leileiFL.mark(lowGroup[1], data.leileiData.targetMakers.bind2);
                data.leileiFL.mark(lowGroup[2], data.leileiData.targetMakers.bind3);
                data.leileiFL.mark(lowGroup[3], data.leileiData.targetMakers.attack5);
            },
            outputStrings: {
                ps顺序: "circle/x/square/triangle",
                优先级: "H1/MT/ST/D1/D2/D3/D4/H2",
                是否标记: "false"
            }
        },
        {
            id: "leilei TOP p2 final analysis 头顶标记",
            //D61 分散
            //D62 分摊
            netRegex: NetRegexes.gainsEffect({ effectId: ["D61", "D62"] }),
            run: (data, matches, output) => {
                if (output.是否标记() !== "true") {
                    return;
                }

                if (matches.effectId === "D62") {
                    data.p2_finalAnalysisGroupDic["stack"].push(data.leileiFL.getRpByHexId(data, matches.targetId));
                } else {
                    data.p2_finalAnalysisGroupDic["spread"].push(data.leileiFL.getRpByHexId(data, matches.targetId));
                }

                data.p2_finalAnalysismarkCount++;
                if (data.p2_finalAnalysismarkCount != 6) {
                    return;
                }

                const rpRuleList = output.优先级().split("/");
                for (const key in data.p2_finalAnalysisGroupDic) {
                    let list = data.p2_finalAnalysisGroupDic[key];
                    list.sort((a, b) => {
                        return rpRuleList.indexOf(a) - rpRuleList.indexOf(b);
                    })
                }

                data.leileiFL.clearMark();
                //分散 攻击1234
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["spread"][0]),
                    data.leileiData.targetMakers.attack1);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["spread"][1]),
                    data.leileiData.targetMakers.attack2);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["spread"][2]),
                    data.leileiData.targetMakers.attack3);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["spread"][3]),
                    data.leileiData.targetMakers.attack4);

                //分摊 锁链12
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["stack"][0]),
                    data.leileiData.targetMakers.bind1);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["stack"][1]),
                    data.leileiData.targetMakers.bind2);

                //无标记 一起分摊 静止12
                let nothingGroup = [];
                for (let i = 0; i < rpRuleList.length; i++) {
                    let rp = rpRuleList[i];
                    if (!data.p2_finalAnalysisGroupDic["stack"].includes(rp) && !data.p2_finalAnalysisGroupDic["spread"].includes(rp)) {
                        nothingGroup.push(rp);
                    }
                }
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, nothingGroup[0]),
                    data.leileiData.targetMakers.stop1);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, nothingGroup[1]),
                    data.leileiData.targetMakers.stop2);
            },
            outputStrings: {
                打法视频: "BV1jT411y7Xi",
                优先级: "H1/MT/ST/D1/D2/D3/D4/H2",
                是否标记: "false"
            }
        },
        {
            id: "leilei TOP p2 二运分摊提醒",
            netRegex: NetRegexes.ability({ id: "7B28" }),
            tts: (data, matches, output) => {
                //小队频道提示音
                if (output.小队频道提示音() === "true") {
                    data.leileiFL.doTextCommand("/p 分攤<se.4>");
                }

                //被投盾的人不分摊
                if (matches.target === data.me && !data.p2_programLB_ignoreStackList.includes(data.me)) {
                    //如果不是核爆的人被投盾了，提醒一下快跑
                    return output.被投盾();
                }

                //核爆的三个人不分摊
                if (data.p2_programLB_ignoreStackList.includes(data.me)) {
                    return;
                }

                return output.分摊();
            },
            outputStrings: {
                分摊: "去分摊",
                被投盾: "远离M",
                小队频道提示音: "true"
            }
        },
        {
            id: "leilei TOP p2 二运核爆",
            netRegex: NetRegexes.headMarker({}),
            run: (data, matches) => {
                const id = getHeadmarkerId(data, matches);
                if (id !== headMarker.programLBFlame) {
                    return;
                }

                //点核爆的三个人不分摊
                data.p2_programLB_ignoreStackList.push(matches.target);
            },
        },
        {
            id: "leilei TOP p3 hello world buff处理",
            //DC4 分摊
            //DC5 大圈
            //DC6 红毒
            //DC7 蓝DNA
            //D65 蓝毒
            netRegex: NetRegexes.gainsEffect({ effectId: ["DC4", "DC5", "DC6", "DC7", "D65"] }),
            condition: (data) => {
                return data.p3_helloWorldBuffCount < 10;
            },
            run: (data, matches, output) => {
                data.p3_helloWorldBuffCount++;
                let key;
                switch (matches.effectId) {
                    case "DC4":
                        key = "share";
                        break;
                    case "DC5":
                        key = "circle";
                        break;
                    case "DC6":
                        key = "red";
                        break;
                    case "DC7":
                        key = "dna";
                        break;
                    case "D65":
                        key = "blue";
                        break;
                    default:
                        break;
                }
                data.p3_helloWorldBuffDic[key].push(matches.target);

                if (data.p3_helloWorldBuffCount != 10) {
                    return;
                }

                let circlePlayer = data.p3_helloWorldBuffDic["circle"][0];
                data.p3_helloWorldCircleColor = data.p3_helloWorldBuffDic["red"].includes(circlePlayer) ? output.红色() : output.蓝色();
                data.p3_helloWorldShareColor = data.p3_helloWorldCircleColor === output.红色() ? output.蓝色() : output.红色();
            },
            outputStrings: {
                红色: "红",
                蓝色: "蓝",
            }
        },
        {
            id: "leilei TOP p3 hello world 第一轮",
            //DC4 分摊
            //DC5 大圈
            //DC6 红毒
            //DC7 蓝DNA
            //D65 蓝毒
            netRegex: NetRegexes.gainsEffect({ effectId: ["DC4", "DC5", "DC6", "DC7", "D65"] }),
            condition: (data) => {
                return data.p3_helloWorldBuffCount == 9;
            },
            delaySeconds: 1,
            tts: (data, matches, output) => {
                if (data.p3_helloWorldBuffDic["share"].includes(data.me)) {
                    //初始分摊
                    return output.放分摊({ color: data.p3_helloWorldShareColor });
                } else if (data.p3_helloWorldBuffDic["circle"].includes(data.me)) {
                    //初始大圈
                    return output.放大圈({ color: data.p3_helloWorldCircleColor });
                } else if (data.p3_helloWorldBuffDic["dna"].includes(data.me)) {
                    //初始dna 第一轮吃大圈
                    return output.吃大圈({ color: data.p3_helloWorldCircleColor });
                } else {
                    //初始无点名 第一轮吃分摊
                    return output.吃分摊({ color: data.p3_helloWorldShareColor });
                }
            },
            outputStrings: {
                放大圈: "去${color}色放大圈",
                放分摊: "去${color}色放分摊",
                吃大圈: "去${color}色两边吃大圈",
                吃分摊: "去${color}色中间吃分摊",
            }
        },
        {
            id: "leilei TOP p3 hello world 第二轮",
            //DC4 分摊
            //DC5 大圈
            //DC6 红毒
            //DC7 蓝DNA
            //D65 蓝毒
            netRegex: NetRegexes.gainsEffect({ effectId: ["DC4", "DC5", "DC6", "DC7", "D65"] }),
            condition: (data) => {
                return data.p3_helloWorldBuffCount == 9;
            },
            delaySeconds: 22,
            tts: (data, matches, output) => {
                if (data.p3_helloWorldBuffDic["share"].includes(data.me)) {
                    //初始分摊 第二轮吃大圈
                    return output.吃大圈({ color: data.p3_helloWorldCircleColor });
                } else if (data.p3_helloWorldBuffDic["circle"].includes(data.me)) {
                    //初始大圈 第二轮吃分摊
                    return output.吃分摊({ color: data.p3_helloWorldShareColor });
                } else if (data.p3_helloWorldBuffDic["dna"].includes(data.me)) {
                    //初始dna 第二轮放大圈
                    return output.放大圈({ color: data.p3_helloWorldCircleColor });
                } else {
                    //初始无点名 第二轮放分摊
                    return output.放分摊({ color: data.p3_helloWorldShareColor });
                }
            },
            outputStrings: {
                放大圈: "去${color}色放大圈",
                放分摊: "去${color}色放分摊",
                吃大圈: "去${color}色两边吃大圈",
                吃分摊: "去${color}色中间吃分摊",
            }
        },
        {
            id: "leilei TOP p3 hello world 第三轮",
            //DC4 分摊
            //DC5 大圈
            //DC6 红毒
            //DC7 蓝DNA
            //D65 蓝毒
            netRegex: NetRegexes.gainsEffect({ effectId: ["DC4", "DC5", "DC6", "DC7", "D65"] }),
            condition: (data) => {
                return data.p3_helloWorldBuffCount == 9;
            },
            delaySeconds: 43,
            tts: (data, matches, output) => {
                if (data.p3_helloWorldBuffDic["share"].includes(data.me)) {
                    //初始分摊 第三轮放大圈
                    return output.放大圈({ color: data.p3_helloWorldCircleColor });
                } else if (data.p3_helloWorldBuffDic["circle"].includes(data.me)) {
                    //初始大圈 第三轮放分摊
                    return output.放分摊({ color: data.p3_helloWorldShareColor });
                } else if (data.p3_helloWorldBuffDic["dna"].includes(data.me)) {
                    //初始dna 第三轮吃分摊
                    return output.吃分摊({ color: data.p3_helloWorldShareColor });
                } else {
                    //初始无点名 第三轮吃大圈
                    return output.吃大圈({ color: data.p3_helloWorldCircleColor });
                }
            },
            outputStrings: {
                放大圈: "去${color}色放大圈",
                放分摊: "去${color}色放分摊",
                吃大圈: "去${color}色两边吃大圈",
                吃分摊: "去${color}色中间吃分摊",
            }
        },
        {
            id: "leilei TOP p3 hello world 第四轮",
            //DC4 分摊
            //DC5 大圈
            //DC6 红毒
            //DC7 蓝DNA
            //D65 蓝毒
            netRegex: NetRegexes.gainsEffect({ effectId: ["DC4", "DC5", "DC6", "DC7", "D65"] }),
            condition: (data) => {
                return data.p3_helloWorldBuffCount == 9;
            },
            delaySeconds: 64,
            tts: (data, matches, output) => {
                if (data.p3_helloWorldBuffDic["share"].includes(data.me)) {
                    //初始分摊 第四轮吃分摊
                    return output.吃分摊({ color: data.p3_helloWorldShareColor });
                } else if (data.p3_helloWorldBuffDic["circle"].includes(data.me)) {
                    //初始大圈 第四轮去分摊后面最远距离直接拉断
                    return output.特殊处理的近线({ color: data.p3_helloWorldShareColor });
                } else if (data.p3_helloWorldBuffDic["dna"].includes(data.me)) {
                    //初始dna 第四轮放分摊
                    return output.放分摊({ color: data.p3_helloWorldShareColor });
                } else {
                    //初始无点名 第四轮放大圈
                    return output.放大圈({ color: data.p3_helloWorldCircleColor });
                }
            },
            outputStrings: {
                放大圈: "去${color}色放大圈",
                放分摊: "去${color}色放分摊",
                特殊处理的近线: "去${color}色中间后面近战最远距离拉断近线",
                吃分摊: "去${color}色中间吃分摊",
            }
        },
    ]
})
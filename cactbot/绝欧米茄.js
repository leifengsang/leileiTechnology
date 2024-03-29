/**
 * 绝欧米茄
 */

/**
 * 麻将阶段
 */
const MAHJONG_PHASE_P1_1 = 1; //P1 拉线踩塔
const MAHJONG_PHASE_P1_2 = 2; //P1 全能之主
const MAHJONG_PHASE_P5_OMEGA = 3; //P5 三运

/**
 * 战斗阶段
 */
const PHASE_OMEGA = 1; //p1
const PHASE_OMEGA_MF = 2; //p2
const PHASE_OMEGA_RECONFIGURED = 3; //p3
const PHASE_BLUE_SCREEN = 4; //p4
const PHASE_DYNAMIS = 5; //p5
const PHASE_ALPHA_OMEGA = 6; //p6

/**
 * P5运动会阶段
 */
const DYNAMIS_PHASE_DELTA = 1; //一运
const DYNAMIS_PHASE_SIGMA = 2; //二运
const DYNAMIS_PHASE_OMEGA = 3; //三运

const headMarker = {
    circle: "01A0",
    triangle: "01A1",
    square: "01A2",
    cross: "01A3",
    programPTStack: "0064",
    programLBFlame: "015A", //P2二运核爆
    dynamisSigmaCannon: "00F4", //P5二运激光炮
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
            omegaPhase: 0,
            mahjongPhase: 0,
            p1_1_mahjongGroupDic: { 1: [], 2: [], 3: [], 4: [] },
            p1_1_mahjongCount: 0,
            p1_1_myMahjongGroup: 0,
            p1_2_mahjongGroupDic: { 1: [], 2: [], 3: [], 4: [] },
            p1_2_mahjongCount: 0,
            p1_2_myMahjongGroup: 0,
            p2_programPT_TTS_Dic: { "M": "", "F": "" },
            p2_programPT_markReverse: false,
            p2_programPT_markCount: 0,
            p2_programPT_markCleared: false,
            p2_programPT_M_casted: false,
            p2_programPT_groupDic: { "circle": [], "triangle": [], "square": [], "cross": [] },
            p2_programPT_highGroup: [],
            p2_programPT_lowGroup: [],
            p2_programPT_stackGroup: [],
            p2_programPT_changeGroup: [],
            p2_finalAnalysismarkCount: 0,
            p2_finalAnalysisGroupDic: { "stack": [], "spread": [] },
            p2_programLB_ignoreStackList: [],
            p3_helloWorldBuffCount: 0,
            p3_helloWorldBuffDic: { "red": [], "blue": [], "dna": [], "share": [], "circle": [] },
            p3_helloWorldCircleColor: "",
            p3_helloWorldShareColor: "",
            p3_waveCannonList: [],
            p5_deltaMarkEnable: false,
            p5_deltaFarHWTransmit2NearGroup: false,
            p5_deltaNearTetherGroup: [],
            p5_sigmaMarkEnable: false,
            p5_sigmaTowerMarkEnable: false,
            p5_omegaMarkEnable: false,
            p5_sigma_TTS_enable: false,
            p5_dynamisPhase: 0,
            p5_dynamisCountDic: {},
            p5_deltaHWGroup: [],
            p5_deltaNearGroup: [],
            p5_deltaFarGroup: [],
            p5_tetherCount: 0,
            p5_sigmaHWNear: "",
            p5_sigmaHWFar: "",
            p5_sigmaGroupDic: { "circle": [], "triangle": [], "square": [], "cross": [] },
            p5_sigmaPSMarkerDic: {},
            p5_sigmaMarkCount: 0,
            p5_omegaMahjongDic: { 1: [], 2: [] },
            p5_omegaHWDic: { "far": [], "near": [] },
        }
    },
    triggers: [
        {
            id: "leilei TOP Headmarker Tracker",
            netRegex: NetRegexes.headMarker({}),
            condition: (data) => undefined === data.leileiDecOffset,
            run: (data, matches) => {
                getHeadmarkerId(data, matches);
            },
        },
        {
            id: "leilei TOP 控制战斗阶段",
            netRegex: NetRegexes.startsUsing({ id: ["7B03", "7B3E", "7B55", "7B81", "7B88"] }),
            run: (data, matches) => {
                switch (matches.id) {
                    case "7B03":
                        data.omegaPhase = PHASE_OMEGA;
                        break;
                    case "7B3E":
                        data.omegaPhase = PHASE_OMEGA_MF;
                        break;
                    case "7B55":
                        data.omegaPhase = PHASE_OMEGA_RECONFIGURED;
                        break;
                    case "7B81":
                        data.omegaPhase = PHASE_BLUE_SCREEN;
                        break;
                    case "7B88":
                        data.omegaPhase = PHASE_DYNAMIS;
                        break;
                    default:
                        break;
                }
                console.log("omegaPhase", data.omegaPhase);
            }
        },
        {
            id: "leilei TOP p1 循环编译",
            netRegex: NetRegexes.startsUsing({ id: "7B03" }),
            run: (data) => {
                data.mahjongPhase = MAHJONG_PHASE_P1_1;
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
                        delay = 2;
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
            infoText: (data, matches, output) => {
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
                        delay = 2;
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
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                content: "去踩塔"
            }
        },
        {
            id: "leilei TOP p1 麻将分组",
            //BBC 1号
            //BBD 2号
            //BBE 3号
            //D7B 4号
            netRegex: NetRegexes.gainsEffect({ effectId: ["BBC", "BBD", "BBE", "D7B"] }),
            condition: (data, matches) => {
                return data.mahjongPhase === MAHJONG_PHASE_P1_1;
            },
            infoText: (data, matches, output) => {
                data.p1_1_mahjongCount++;
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
                data.p1_1_mahjongGroupDic[mahjongGroup].push(matches.target);
                if (matches.target === data.me) {
                    data.p1_1_myMahjongGroup = mahjongGroup;
                }

                if (data.p1_1_mahjongCount != 8) {
                    return;
                }
                return output.content({
                    rp: data.leileiFL.getRpByName(data, data.p1_1_mahjongGroupDic[data.p1_1_myMahjongGroup].find((v) => {
                        return v !== data.me;
                    }))
                });
            },
            outputStrings: {
                content: "${rp}"
            }
        },
        {
            id: "leilei TOP p1 全能之主",
            netRegex: NetRegexes.startsUsing({ id: "7B0B" }),
            run: (data) => {
                data.mahjongPhase = MAHJONG_PHASE_P1_2;
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
            infoText: (data, matches, output) => {
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
            infoText: (data, matches, output) => {
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
                content: "${rp}"
            }
        },
        {
            id: "leilei TOP P2一运头顶标记",
            netRegex: NetRegexes.headMarker({}),
            condition: (data) => {
                return data.omegaPhase == PHASE_OMEGA_MF;
            },
            infoText: "",
            preRun: (data, matches) => {
                const id = getHeadmarkerId(data, matches);
                const headMarkers = [
                    headMarker.circle,
                    headMarker.triangle,
                    headMarker.square,
                    headMarker.cross,
                ];
                if (!headMarkers.includes(id)) {
                    return;
                }

                let psType = "";
                switch (id) {
                    case headMarker.circle:
                        psType = "circle";
                        break;
                    case headMarker.triangle:
                        psType = "triangle";
                        break;
                    case headMarker.square:
                        psType = "square";
                        break;
                    case headMarker.cross:
                        psType = "cross";
                        break;
                    default:
                        break;
                }
                data.p2_programPT_groupDic[psType].push(data.leileiFL.getRpByHexId(data, matches.targetId));
                data.p2_programPT_markCount++;
                if (data.p2_programPT_markCount != 8) {
                    return;
                }
            },
            run: (data, matches, output) => {
                if (output.是否标记() !== "true") {
                    return;
                }

                const id = getHeadmarkerId(data, matches);
                const headMarkers = [
                    headMarker.circle,
                    headMarker.triangle,
                    headMarker.square,
                    headMarker.cross,
                ]
                if (!headMarkers.includes(id)) {
                    return;
                }

                if (data.p2_programPT_markCount != 8) {
                    return;
                }

                const rpRuleList = output.优先级().split("/");
                for (const key in data.p2_programPT_groupDic) {
                    let list = data.p2_programPT_groupDic[key];
                    list.sort((a, b) => {
                        return rpRuleList.indexOf(a) - rpRuleList.indexOf(b);
                    })
                }

                const psRuleList = output.ps顺序().split("/");
                data.p2_programPT_highGroup = [
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[0]][0]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[1]][0]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[2]][0]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[3]][0]),
                ];
                data.p2_programPT_lowGroup = [
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[0]][1]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[1]][1]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[2]][1]),
                    data.leileiFL.getHexIdByRp(data, data.p2_programPT_groupDic[psRuleList[3]][1]),
                ];
                if (data.p2_programPT_markReverse) {
                    data.p2_programPT_lowGroup.reverse();
                }

                data.leileiFL.clearMark();

                data.leileiFL.mark(data.p2_programPT_highGroup[0], data.leileiData.targetMarkers.attack1);
                data.leileiFL.mark(data.p2_programPT_highGroup[1], data.leileiData.targetMarkers.attack2);
                data.leileiFL.mark(data.p2_programPT_highGroup[2], data.leileiData.targetMarkers.attack3);
                data.leileiFL.mark(data.p2_programPT_highGroup[3], data.leileiData.targetMarkers.attack4);

                data.leileiFL.mark(data.p2_programPT_lowGroup[0], data.leileiData.targetMarkers.bind1);
                data.leileiFL.mark(data.p2_programPT_lowGroup[1], data.leileiData.targetMarkers.bind2);
                data.leileiFL.mark(data.p2_programPT_lowGroup[2], data.leileiData.targetMarkers.bind3);
                let rightBottomMarker = output.是否用十字代替攻击5() === "true" ? data.leileiData.targetMarkers.cross : data.leileiData.targetMarkers.attack5;
                data.leileiFL.mark(data.p2_programPT_lowGroup[3], rightBottomMarker);
            },
            outputStrings: {
                ps顺序: "circle/cross/triangle/square",
                优先级: "H1/MT/ST/D1/D2/D3/D4/H2",
                是否用十字代替攻击5: "false",
                是否标记: "false"
            }
        },
        {
            id: "leilei TOP p2一运 取消标记",
            //7B25 月环
            //7B26 钢铁
            netRegex: NetRegexes.startsUsing({ id: ["7B25", "7B26"] }),
            infoText: "",
            run: (data, matches, output) => {
                //前半不处理
                if (!data.p2_programPT_M_casted) {
                    data.p2_programPT_M_casted = true;
                    return;
                }

                //干掉之前的标记
                if (output.取消标记() === "true") {
                    if (!data.p2_programPT_markCleared) {
                        data.p2_programPT_markCleared = true;
                        data.leileiFL.clearMark();
                    }
                }
                return;
            },
            outputStrings: {
                取消标记: "false"
            }
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
            id: "leilei TOP P2一运大眼前远近线提醒",
            //D63 靠近
            //D64 远离
            netRegex: NetRegexes.gainsEffect({ effectId: ["D63", "D64"] }),
            condition: (data, matches) => {
                return data.omegaPhase == PHASE_OMEGA_MF && matches.target === data.me;
            },
            delaySeconds: 8,
            infoText: (data, matches, output) => {
                return matches.effectId === "D64" ? output.远线() : output.近线();
            },
            outputStrings: {
                远线: "远离远离",
                近线: "靠近靠近"
            }
        },
        {
            id: "leilei TOP P2一运击退分摊前远近线提醒",
            //D63 靠近
            //D64 远离
            netRegex: NetRegexes.gainsEffect({ effectId: ["D63", "D64"] }),
            condition: (data, matches) => {
                return data.omegaPhase == PHASE_OMEGA_MF && matches.target === data.me;
            },
            delaySeconds: 15,
            infoText: (data, matches, output) => {
                return matches.effectId === "D64" ? output.远线() : output.近线();
            },
            outputStrings: {
                远线: "远离远离",
                近线: "靠近靠近"
            }
        },
        {
            id: "leilei TOP p2 二运分摊提醒",
            netRegex: NetRegexes.ability({ id: "7B28" }),
            condition: (data) => {
                return data.omegaPhase == PHASE_OMEGA_MF;
            },
            suppressSeconds: 1,
            run: (data, matches, output) => {
                //小队频道提示音
                if (output.小队频道提示音() === "true") {
                    data.leileiFL.doTextCommand("/p 分攤<se.4>");
                }
            },
            infoText: (data, matches, output) => {
                //被投盾的人不分摊
                if (matches.target === data.me && !data.p2_programLB_ignoreStackList.includes(data.me)) {
                    //如果不是核爆的人被投盾了，提醒一下快跑
                    return output.被投盾();
                }

                //核爆的三个人不分摊
                if (output.核爆逃课() !== "true" && data.p2_programLB_ignoreStackList.includes(data.me)) {
                    return;
                }

                return output.分摊();
            },
            outputStrings: {
                分摊: "去分摊",
                被投盾: "远离M",
                小队频道提示音: "false",
                核爆逃课: "false"
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
            id: "leilei TOP p2.5 头顶标记",
            //D61 分散
            //D62 分摊
            netRegex: NetRegexes.gainsEffect({ effectId: ["D61", "D62"] }),
            infoText: "",
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

                let nothingGroup = [];
                for (let i = 0; i < rpRuleList.length; i++) {
                    let rp = rpRuleList[i];
                    if (!data.p2_finalAnalysisGroupDic["stack"].includes(rp) && !data.p2_finalAnalysisGroupDic["spread"].includes(rp)) {
                        nothingGroup.push(rp);
                    }
                }

                //分散 攻击1234
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["spread"][0]),
                    data.leileiData.targetMarkers.attack1);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["spread"][1]),
                    data.leileiData.targetMarkers.attack2);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["spread"][2]),
                    data.leileiData.targetMarkers.attack3);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["spread"][3]),
                    data.leileiData.targetMarkers.attack4);

                //分摊 锁链12
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["stack"][0]),
                    data.leileiData.targetMarkers.bind1);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p2_finalAnalysisGroupDic["stack"][1]),
                    data.leileiData.targetMarkers.bind2);

                //无标记 一起分摊 静止12
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, nothingGroup[0]),
                    data.leileiData.targetMarkers.stop1);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, nothingGroup[1]),
                    data.leileiData.targetMarkers.stop2);
            },
            outputStrings: {
                打法视频: "BV1jT411y7Xi",
                优先级: "H1/MT/ST/D1/D2/D3/D4/H2",
                是否标记: "false"
            }
        },
        {
            id: "leilei TOP p3 hello world 清除2.5标记",
            netRegex: NetRegexes.startsUsing({ id: "7B55" }),
            infoText: "",
            run: (data, matches, output) => {
                if (output.取消标记() === "true") {
                    data.leileiFL.clearMark();
                }
            },
            outputStrings: {
                取消标记: "false"
            }
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
            id: "leilei TOP p3 hello world 同组播报",
            netRegex: NetRegexes.gainsEffect({ effectId: ["DC4", "DC5", "DC6", "DC7", "D65"] }),
            condition: (data) => {
                return data.p3_helloWorldBuffCount == 9;
            },
            delaySeconds: 1,
            infoText: (data, matches, output) => {
                let target;
                if (data.p3_helloWorldBuffDic["share"].includes(data.me)) {
                    target = data.p3_helloWorldBuffDic["share"].find((v) => {
                        return v !== data.me;
                    });
                } else if (data.p3_helloWorldBuffDic["circle"].includes(data.me)) {
                    target = data.p3_helloWorldBuffDic["circle"].find((v) => {
                        return v !== data.me;
                    });
                } else if (data.p3_helloWorldBuffDic["dna"].includes(data.me)) {
                    target = data.p3_helloWorldBuffDic["dna"].find((v) => {
                        return v !== data.me;
                    });
                } else {
                    target = data.party.partyNames_.find((v) => {
                        if (v === data.me) {
                            return false;
                        }

                        for (const key in data.p3_helloWorldBuffDic) {
                            if (key === "blue" || key === "red") {
                                continue;
                            }
                            if (data.p3_helloWorldBuffDic[key].includes(v)) {
                                return false;
                            }
                        }
                        return true;
                    });
                }

                return output.content({ rp: data.leileiFL.getRpByName(data, target) });
            },
            outputStrings: {
                content: "${rp}"
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
            delaySeconds: 6,
            infoText: (data, matches, output) => {
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
            delaySeconds: 27,
            infoText: (data, matches, output) => {
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
            delaySeconds: 48,
            infoText: (data, matches, output) => {
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
            delaySeconds: 69,
            infoText: (data, matches, output) => {
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
                特殊处理的近线: "去${color}色中间吃分摊",
                吃分摊: "去${color}色中间吃分摊",
            }
        },
        {
            id: "leilei TOP p3 小电视屏幕 屏幕点名",
            netRegex: NetRegexes.gainsEffect({ effectId: ["D7C", "D7D"] }),
            condition: (data) => {
                return data.omegaPhase == PHASE_OMEGA_RECONFIGURED;
            },
            run: (data, matches) => {
                data.p3_waveCannonList.push(data.leileiFL.getRpByHexId(data, matches.targetId));
            }
        },
        {
            id: "leilei TOP p3 小电视屏幕头顶标记",
            //7B6B 右屏幕
            //7B6C 左屏幕
            netRegex: NetRegexes.startsUsing({ id: ["7B6B", "7B6C"] }),
            infoText: "",
            run: (data, matches, output) => {
                if (output.是否标记() !== "true") {
                    return;
                }

                let currentRPRuleList = output.优先级().split("/");
                let originalRPRuleList = output.优先级().split("/");
                if (matches.id === "7B6B") {
                    //右屏幕
                    if (output.右屏幕是否逆反优先级() === "true") {
                        currentRPRuleList.reverse();
                    }
                } else {
                    //左屏幕
                    if (output.左屏幕是否逆反优先级() === "true") {
                        currentRPRuleList.reverse();
                    }
                }


                data.p3_waveCannonList.sort((a, b) => {
                    return currentRPRuleList.indexOf(a) - currentRPRuleList.indexOf(b);
                });

                let otherList = data.party.partyIds_.filter((v) => {
                    return !data.p3_waveCannonList.includes(data.leileiFL.getRpByHexId(data, v));
                }).map((v) => {
                    return data.leileiFL.getRpByHexId(data, v);
                });

                let finalList = [];
                if (output.五号位是否一定选择最高正序优先级的远程() === "true") {
                    otherList.sort((a, b) => {
                        return originalRPRuleList.indexOf(a) - originalRPRuleList.indexOf(b);
                    });
                    const ranged = otherList.find((v) => {
                        return data.leileiFL.isRanged(v);
                    });
                    finalList.push(ranged);
                    otherList = otherList.filter((v) => {
                        return v !== ranged;
                    });
                }

                otherList.sort((a, b) => {
                    return currentRPRuleList.indexOf(a) - currentRPRuleList.indexOf(b);
                });
                finalList = otherList.concat(finalList);

                data.leileiFL.clearMark();

                //点小电视 锁链123
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p3_waveCannonList[0]), data.leileiData.targetMarkers.bind1);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p3_waveCannonList[1]), data.leileiData.targetMarkers.bind2);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, data.p3_waveCannonList[2]), data.leileiData.targetMarkers.bind3);

                //其他玩家 攻击12345
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, finalList[0]), data.leileiData.targetMarkers.attack1);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, finalList[1]), data.leileiData.targetMarkers.attack2);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, finalList[2]), data.leileiData.targetMarkers.attack3);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, finalList[3]), data.leileiData.targetMarkers.attack4);
                data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, finalList[4]), data.leileiData.targetMarkers.attack5);
            },
            outputStrings: {
                优先级: "H2/H1/D4/D3/D2/D1/ST/MT",
                左屏幕是否逆反优先级: "false",
                右屏幕是否逆反优先级: "false",
                五号位是否一定选择最高正序优先级的远程: "true",
                是否标记: "false"
            }
        },
        {
            id: "leilei TOP p3 清除小电视屏幕头顶标记",
            //7B6B 右屏幕
            //7B6C 左屏幕
            netRegex: NetRegexes.startsUsing({ id: ["7B6B", "7B6C"] }),
            delaySeconds: 20,
            infoText: "",
            run: (data, matches, output) => {
                if (output.取消标记() !== "true") {
                    return;
                }
                data.leileiFL.clearMark();
            },
            outputStrings: {
                取消标记: "false"
            }
        },
        {
            id: "leilei TOP 控制P5阶段",
            netRegex: NetRegexes.startsUsing({ id: ["7B88", "8014", "8015"] }),
            run: (data, matches, output) => {
                data.p5_deltaMarkEnable = output.p5一运是否标记() === "true";
                data.p5_deltaFarHWTransmit2NearGroup = output.P5一运是否是近线引导远hw() === "true";
                data.p5_sigmaMarkEnable = output.p5二运是否标记() === "true";
                data.p5_sigmaTowerMarkEnable = output.P5二运踩塔是否标记() === "true";
                data.p5_omegaMarkEnable = output.p5三运是否标记() === "true";
                data.p5_sigma_TTS_enable = output.p5二运tts() === "true";

                switch (matches.id) {
                    case "7B88":
                        data.p5_dynamisPhase = DYNAMIS_PHASE_DELTA;
                        if (data.p5_deltaMarkEnable) {
                            data.leileiFL.clearMark();
                        }
                        break;
                    case "8014":
                        data.p5_dynamisPhase = DYNAMIS_PHASE_SIGMA;
                        if (data.p5_sigmaMarkEnable || data.p5_sigmaTowerMarkEnable) {
                            data.leileiFL.clearMark();
                        }
                        break;
                    case "8015":
                        data.p5_dynamisPhase = DYNAMIS_PHASE_OMEGA;
                        data.mahjongPhase = MAHJONG_PHASE_P5_OMEGA;
                        if (data.p5_omegaMarkEnable) {
                            data.leileiFL.clearMark();
                        }
                        break;
                    default:
                        break;
                }
                console.log("dynamisPhase", data.p5_dynamisPhase);
            },
            infoText: "",
            outputStrings: {
                p5一运是否标记: "false",
                P5一运是否是近线引导远hw: "false",
                p5二运是否标记: "false",
                P5二运踩塔是否标记: "false",
                p5二运tts: "false",
                p5三运是否标记: "false",
            }
        },
        {
            id: "leilei TOP 潜能量buff",
            netRegex: NetRegexes.gainsEffect({ effectId: ["D74"] }),
            run: (data, matches) => {
                //更新潜能量层数
                data.p5_dynamisCountDic[matches.targetId] = parseInt(matches.count);
            }
        },
        {
            id: "leilei TOP p5一运 hw远近buff",
            //D72 近
            //D73 远
            netRegex: NetRegexes.gainsEffect({ effectId: ["D72", "D73"] }),
            condition: (data) => {
                return data.p5_dynamisPhase == DYNAMIS_PHASE_DELTA;
            },
            preRun: (data, matches) => {
                data.p5_deltaHWGroup.push(matches.targetId);
            },
            run: (data, matches) => {
                if (!data.p5_deltaMarkEnable) {
                    return;
                }

                let markType;
                if (matches.effectId === "D72") {
                    markType = data.leileiData.targetMarkers.stop2;
                } else {
                    markType = data.leileiData.targetMarkers.stop1;
                }

                data.leileiFL.mark(matches.targetId, markType);

                if (data.p5_deltaHWGroup.length < 2) {
                    return;
                }

                //远线引导远HW
                if (!data.p5_deltaFarHWTransmit2NearGroup) {
                    //处理另外两个无hwbuff的远线
                    const list = data.p5_deltaFarGroup.filter((v) => {
                        return !data.p5_deltaHWGroup.includes(v);
                    });

                    data.leileiFL.mark(list[0], data.leileiData.targetMarkers.circle);
                    data.leileiFL.mark(list[1], data.leileiData.targetMarkers.cross);
                }
            }
        },
        {
            id: "leilei TOP p5一运 远近线",
            //D70 近
            //DB0 远
            netRegex: NetRegexes.gainsEffect({ effectId: ["D70", "DB0"] }),
            condition: (data) => {
                return data.p5_dynamisPhase == DYNAMIS_PHASE_DELTA;
            },
            run: (data, matches) => {
                if (matches.effectId === "D70") {
                    data.p5_deltaNearGroup.push(matches.targetId);
                } else {
                    data.p5_deltaFarGroup.push(matches.targetId);
                }
            }
        },
        {
            id: "leilei TOP p5一运 连线",
            netRegex: NetRegexes.tether({}),
            condition: (data) => {
                return data.p5_dynamisPhase == DYNAMIS_PHASE_DELTA && data.p5_tetherCount < 4;
            },
            preRun: (data) => {
                data.p5_tetherCount++;
            },
            run: (data, matches) => {
                if (!data.p5_deltaMarkEnable) {
                    return;
                }

                if (data.p5_deltaNearGroup.includes(matches.sourceId)) {
                    //近线组
                    data.p5_deltaNearTetherGroup.push([matches.sourceId, matches.targetId]);
                    //先把两组存下来，后续按逻辑处理
                    if (data.p5_deltaNearTetherGroup.length < 2) {
                        return;
                    }

                    /**
                     * 在近线引导远HW的情况下，优先标记某些职能所在的分组
                     * H1>H2>其他
                     * @param {*} rp 
                     * @returns value to compare
                     */
                    const rpCompareFunction = (rp) => {
                        if (rp === "H1") {
                            return 2;
                        } else if (rp === "H2") {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                    if (data.p5_deltaFarHWTransmit2NearGroup) {
                        //近线引导远HW
                        let highestRP = -1;
                        let highestRPIndex;
                        for (let i = 0; i < data.p5_deltaNearTetherGroup.length; i++) {
                            let rp = Math.max(rpCompareFunction(data.leileiFL.getRpByHexId(data, data.p5_deltaNearTetherGroup[i][0])),
                                rpCompareFunction(data.leileiFL.getRpByHexId(data, data.p5_deltaNearTetherGroup[i][1])));
                            if (rp > highestRP) {
                                highestRP = rp;
                                highestRPIndex = i;
                            }
                        }
                        data.leileiFL.mark(data.p5_deltaNearTetherGroup[highestRPIndex][0], data.leileiData.targetMarkers.attack1);
                        data.leileiFL.mark(data.p5_deltaNearTetherGroup[highestRPIndex][1], data.leileiData.targetMarkers.attack2);
                        data.leileiFL.mark(data.p5_deltaNearTetherGroup[highestRPIndex ^ 1][0], data.leileiData.targetMarkers.circle);
                        data.leileiFL.mark(data.p5_deltaNearTetherGroup[highestRPIndex ^ 1][1], data.leileiData.targetMarkers.cross);
                    } else {
                        //远线引导远HW
                        data.leileiFL.mark(data.p5_deltaNearTetherGroup[0][0], data.leileiData.targetMarkers.attack1);
                        data.leileiFL.mark(data.p5_deltaNearTetherGroup[0][1], data.leileiData.targetMarkers.attack2);
                        data.leileiFL.mark(data.p5_deltaNearTetherGroup[1][0], data.leileiData.targetMarkers.attack3);
                        data.leileiFL.mark(data.p5_deltaNearTetherGroup[1][1], data.leileiData.targetMarkers.attack4);
                    }
                }
            }
        },
        {
            id: "leilei TOP p5二运远近线提醒",
            //D63 靠近
            //D64 远离
            netRegex: NetRegexes.gainsEffect({ effectId: ["D63", "D64"] }),
            condition: (data, matches) => {
                return data.omegaPhase == PHASE_DYNAMIS && matches.target === data.me;
            },
            delaySeconds: 10,
            infoText: (data, matches, output) => {
                return matches.effectId === "D64" ? output.远线() : output.近线();
            },
            outputStrings: {
                远线: "远离远离",
                近线: "靠近靠近"
            }
        },
        {
            id: "leilei TOP p5二运 hw远近buff",
            netRegex: NetRegexes.gainsEffect({ effectId: ["D72", "D73"] }),
            condition: (data) => {
                return data.p5_dynamisPhase == DYNAMIS_PHASE_SIGMA;
            },
            run: (data, matches) => {
                if (matches.effectId === "D72") {
                    data.p5_sigmaHWNear = matches.targetId;
                } else {
                    data.p5_sigmaHWFar = matches.targetId;
                }
            }
        },
        {
            id: "leilei TOP p5二运 索尼头顶标记",
            netRegex: NetRegexes.headMarker({}),
            condition: (data) => {
                return data.p5_dynamisPhase == DYNAMIS_PHASE_SIGMA;
            },
            infoText: "",
            preRun: (data, matches, output) => {
                const id = getHeadmarkerId(data, matches);
                const headMarkers = [
                    headMarker.circle,
                    headMarker.triangle,
                    headMarker.square,
                    headMarker.cross,
                ]
                if (!headMarkers.includes(id)) {
                    return;
                }

                let psType = "";
                switch (id) {
                    case headMarker.circle:
                        psType = "circle";
                        break;
                    case headMarker.triangle:
                        psType = "triangle";
                        break;
                    case headMarker.square:
                        psType = "square";
                        break;
                    case headMarker.cross:
                        psType = "cross";
                        break;
                    default:
                        break;
                }
                data.p5_sigmaGroupDic[psType].push(matches.targetId);
                data.p5_sigmaMarkCount++;
                if (data.p5_sigmaMarkCount != 8) {
                    return;
                }

                /**
                 * 3215
                 * 4①②③
                 */
                const psRuleList = output.ps顺序().split("/");
                //左1
                data.p5_sigmaPSMarkerDic[data.p5_sigmaGroupDic[psRuleList[0]][0]] = data.leileiData.targetMarkers.attack3;
                data.p5_sigmaPSMarkerDic[data.p5_sigmaGroupDic[psRuleList[0]][1]] = data.leileiData.targetMarkers.attack4;

                //左2
                data.p5_sigmaPSMarkerDic[data.p5_sigmaGroupDic[psRuleList[1]][0]] = data.leileiData.targetMarkers.attack2;
                data.p5_sigmaPSMarkerDic[data.p5_sigmaGroupDic[psRuleList[1]][1]] = data.leileiData.targetMarkers.bind1;

                //右2
                data.p5_sigmaPSMarkerDic[data.p5_sigmaGroupDic[psRuleList[2]][0]] = data.leileiData.targetMarkers.attack1;
                data.p5_sigmaPSMarkerDic[data.p5_sigmaGroupDic[psRuleList[2]][1]] = data.leileiData.targetMarkers.bind2;

                //右1
                let rightTopMarker = output.是否用十字代替攻击5() === "true" ? data.leileiData.targetMarkers.cross : data.leileiData.targetMarkers.attack5;
                data.p5_sigmaPSMarkerDic[data.p5_sigmaGroupDic[psRuleList[3]][0]] = rightTopMarker;
                data.p5_sigmaPSMarkerDic[data.p5_sigmaGroupDic[psRuleList[3]][1]] = data.leileiData.targetMarkers.bind3;
            },
            run: (data, matches, output) => {
                if (!data.p5_sigmaTowerMarkEnable) {
                    return;
                }

                const id = getHeadmarkerId(data, matches);
                const headMarkers = [
                    headMarker.circle,
                    headMarker.triangle,
                    headMarker.square,
                    headMarker.cross,
                ]
                if (!headMarkers.includes(id)) {
                    return;
                }

                if (data.p5_sigmaMarkCount != 8) {
                    return;
                }

                data.party.partyIds_.forEach(e => {
                    data.leileiFL.mark(e, data.p5_sigmaPSMarkerDic[e]);
                });
            },
            outputStrings: {
                ps顺序: "circle/cross/triangle/square",
                是否用十字代替攻击5: "false"
            }
        },
        {
            id: "leilei TOP p5二运 踩塔播报",
            netRegex: NetRegexes.gainsEffect({ effectId: ["D80"] }),
            delaySeconds: 5,
            condition: (data, matches) => {
                return data.p5_dynamisPhase == DYNAMIS_PHASE_SIGMA && matches.target === data.me;
            },
            infoText: (data, matches, output) => {
                if (!data.p5_sigma_TTS_enable) {
                    return;
                }
                return output[`${data.p5_sigmaPSMarkerDic[data.leileiFL.getHexIdByName(data, data.me)]}`]();
            },
            outputStrings: {
                attack1: "逆1",
                attack2: "逆2",
                attack3: "逆3",
                attack4: "逆1双人塔",
                bind1: "顺1",
                bind2: "顺2",
                bind3: "顺3",
                attack5: "顺伊双人塔",
                cross: "顺伊双人塔",
            }
        },
        {
            id: "leilei TOP p5二运 踩塔前取消头顶标记",
            netRegex: NetRegexes.gainsEffect({ effectId: ["D80"] }),
            delaySeconds: 13,
            condition: (data, matches) => {
                return data.p5_dynamisPhase == DYNAMIS_PHASE_SIGMA && matches.target === data.me;
            },
            run: (data, matches, output) => {
                if (!data.p5_sigmaTowerMarkEnable) {
                    return;
                }

                data.leileiFL.clearMark();
            },
        },
        {
            id: "leilei TOP p5二运 踩塔时切换为后半标记",
            netRegex: NetRegexes.gainsEffect({ effectId: ["D80"] }),
            delaySeconds: 16,
            condition: (data, matches) => {
                return data.p5_dynamisPhase == DYNAMIS_PHASE_SIGMA && matches.target === data.me;
            },
            infoText: "",
            run: (data, matches, output) => {
                if (!data.p5_sigmaMarkEnable) {
                    return;
                }

                let markedList = [data.p5_sigmaHWNear, data.p5_sigmaHWFar];
                //远近buff
                data.leileiFL.mark(data.p5_sigmaHWFar, data.leileiData.targetMarkers.stop1);
                data.leileiFL.mark(data.p5_sigmaHWNear, data.leileiData.targetMarkers.stop2);

                //持有一层潜能量且没有远近buff
                let list = data.party.partyIds_.filter((v) => {
                    return data.p5_dynamisCountDic[v] == 1;
                }).filter((v) => {
                    return v != data.p5_sigmaHWNear && v != data.p5_sigmaHWFar;
                });

                const rpRuleList = output.优先级().split("/");
                list.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });

                data.leileiFL.mark(list[0], data.leileiData.targetMarkers.circle);
                data.leileiFL.mark(list[1], data.leileiData.targetMarkers.cross);

                markedList.push(list[0], list[1]);
                let otherList = data.party.partyIds_.filter((v) => {
                    return !markedList.includes(v);
                });
                otherList.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });

                data.leileiFL.mark(otherList[0], data.leileiData.targetMarkers.attack1);
                data.leileiFL.mark(otherList[1], data.leileiData.targetMarkers.attack2);
                data.leileiFL.mark(otherList[2], data.leileiData.targetMarkers.attack3);
                data.leileiFL.mark(otherList[3], data.leileiData.targetMarkers.attack4);
            },
            outputStrings: {
                优先级: "MT/ST/H1/H2/D1/D2/D3/D4",
            }
        },
        {
            id: "leilei TOP p5三运 麻将",
            //BBC 1号
            //BBD 2号
            netRegex: NetRegexes.gainsEffect({ effectId: ["BBC", "BBD"] }),
            condition: (data, matches) => {
                return data.mahjongPhase === MAHJONG_PHASE_P5_OMEGA;
            },
            run: (data, matches) => {
                let number;
                if (matches.effectId === "BBC") {
                    number = 1;
                } else {
                    number = 2;
                }
                data.p5_omegaMahjongDic[number].push(matches.targetId);
            },
        },
        {
            id: "leilei TOP p5三运 hw远近buff",
            //D72 近
            //D73 远
            netRegex: NetRegexes.gainsEffect({ effectId: ["D72", "D73"] }),
            condition: (data) => {
                return data.p5_dynamisPhase == DYNAMIS_PHASE_OMEGA;
            },
            run: (data, matches) => {
                let key;
                if (matches.effectId == "D72") {
                    key = "near";
                } else {
                    key = "far";
                }
                data.p5_omegaHWDic[key].push(matches.targetId);
            }
        },
        {
            id: "leilei TOP P5三运 上饼",
            netRegex: NetRegexes.startsUsing({ id: "8015" }),
            delaySeconds: 3,
            infoText: "",
            run: (data, matches, output) => {
                let rp = output.带饼职能();
                if (data.leileiFL.isRPExists(data, rp)) {
                    data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, rp), data.leileiData.targetMarkers.triangle);
                }
            },
            outputStrings: {
                带饼职能: "",
                注: "不填就不上三角"
            }
        },
        {
            id: "leilei TOP P5三运 前半头顶标记",
            netRegex: NetRegexes.startsUsing({ id: "8015" }),
            delaySeconds: 28,
            infoText: "",
            run: (data, matches, output) => {
                if (!data.p5_omegaMarkEnable) {
                    return;
                }

                let far = data.p5_omegaHWDic["far"].find((v) => {
                    return data.p5_omegaMahjongDic[1].includes(v);
                });
                let near = data.p5_omegaHWDic["near"].find((v) => {
                    return data.p5_omegaMahjongDic[1].includes(v);
                });
                //远近buff
                data.leileiFL.mark(far, data.leileiData.targetMarkers.stop1);
                data.leileiFL.mark(near, data.leileiData.targetMarkers.stop2);

                const rpRuleList = output.优先级().split("/");
                //没有第一轮远近buff
                let list = data.party.partyIds_.filter((v) => {
                    return v != near && v != far;
                }).sort((a, b) => {
                    //2层buff优先
                    if (data.p5_dynamisCountDic[a] != data.p5_dynamisCountDic[b]) {
                        return data.p5_dynamisCountDic[a] == 2 ? -1 : 1;
                    }

                    //有2号麻将的优先
                    if (data.p5_omegaMahjongDic[2].includes(a) != data.p5_omegaMahjongDic[2].includes(b)) {
                        return data.p5_omegaMahjongDic[2].includes(a) ? -1 : 1;
                    }

                    //按照优先级排序
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });

                //小电视圆圈十字
                data.leileiFL.mark(list[0], data.leileiData.targetMarkers.circle);
                data.leileiFL.mark(list[1], data.leileiData.targetMarkers.cross);
                //剩下1234
                data.leileiFL.mark(list[2], data.leileiData.targetMarkers.attack1);
                data.leileiFL.mark(list[3], data.leileiData.targetMarkers.attack2);
                data.leileiFL.mark(list[4], data.leileiData.targetMarkers.attack3);
                data.leileiFL.mark(list[5], data.leileiData.targetMarkers.attack4);
            },
            outputStrings: {
                优先级: "MT/ST/H1/H2/D1/D2/D3/D4",
            }
        },
        {
            id: "leilei TOP P5三运 清除前半头顶标记",
            netRegex: NetRegexes.startsUsing({ id: "8015" }),
            delaySeconds: 40,
            run: (data, matches, output) => {
                if (!data.p5_omegaMarkEnable) {
                    return;
                }

                data.leileiFL.clearMark();
            },
        },
        {
            id: "leilei TOP P5三运 后半头顶标记",
            netRegex: NetRegexes.startsUsing({ id: "8015" }),
            delaySeconds: 45,
            infoText: "",
            run: (data, matches, output) => {
                if (!data.p5_omegaMarkEnable) {
                    return;
                }

                let fullList = data.party.partyIds_.filter((v) => {
                    return data.p5_dynamisCountDic[v] == 3;
                });
                //3层潜能量接线 圆圈十字
                data.leileiFL.mark(fullList[0], data.leileiData.targetMarkers.circle);
                data.leileiFL.mark(fullList[1], data.leileiData.targetMarkers.cross);

                let far = data.p5_omegaHWDic["far"].find((v) => {
                    return data.p5_omegaMahjongDic[2].includes(v);
                });
                let near = data.p5_omegaHWDic["near"].find((v) => {
                    return data.p5_omegaMahjongDic[2].includes(v);
                });
                //远近buff 禁止12
                data.leileiFL.mark(far, data.leileiData.targetMarkers.stop1);
                data.leileiFL.mark(near, data.leileiData.targetMarkers.stop2);

                //其他四个闲人
                const rpRuleList = output.优先级().split("/");
                let otherList = data.party.partyIds_.filter((v) => {
                    return !fullList.includes(v) && v != far && v != near;
                }).sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });
                data.leileiFL.mark(otherList[0], data.leileiData.targetMarkers.attack1);
                data.leileiFL.mark(otherList[1], data.leileiData.targetMarkers.attack3);
                data.leileiFL.mark(otherList[2], data.leileiData.targetMarkers.attack2);
                data.leileiFL.mark(otherList[3], data.leileiData.targetMarkers.attack4);
            },
            outputStrings: {
                优先级: "MT/ST/H1/H2/D1/D2/D3/D4",
                注: "优先级高=>低=攻击1324"
            }
        },
        {
            id: "leilei TOP P5狂暴读条 取消标记",
            netRegex: NetRegexes.startsUsing({ id: "7B87" }),
            infoText: "",
            run: (data, matches, output) => {
                if (output.取消标记() !== "true") {
                    return;
                }

                data.leileiFL.clearMark();
            },
            outputStrings: {
                取消标记: "false"
            }
        },
    ]
})
/**
 * 绝伊甸
 */

/**
 * 是否标记
 * @param {*} data 
 * @param {*} output 
 * @returns 
 */
function isMarkEnable(data, output) {
    return data.triggerSetConfig.globalMarkEnable && output.是否标记().toLowerCase() === "true";
}

function convertFieldMarker(content) {
    let result;
    switch (content) {
        case "AC":
            result = "正北正南";
            break;
        case "BD":
            result = "正西正东";
            break;
        case "13":
            result = "西北东南";
            break;
        case "24":
            result = "东北西南";
            break;
    }
    return result;
}

function convertFateBreakerMarker(content) {
    let result;
    switch (content) {
        case "04":
            result = "东北西南";
            break;
        case "15":
            result = "正西正东";
            break;
        case "26":
            result = "西北东南";
            break;
        case "37":
            result = "正北正南";
            break;
    }
    return result;
};

function checkPosition(x, y, compareX, compareY, offset = 7) {
    return compareX - offset <= x && x <= compareX + offset && compareY - offset <= y && y < + compareY + offset;
}

const headMarker = {
    iceNeedle: "007F", //冰花
}

/**
 * 战斗阶段
 */
const PHASE_FATE_BREAKER = 1; //p1
const PHASE_USURPER_OF_FROST = 2; //p2
const PHASE_ORACLE_OF_DARKNESS = 3; //p3
const PHASE_ENTER_THE_DRAGON = 4; //p4
const PHASE_PANDORA = 5; //p5

const P4_PHASE_DRAGON_SONG = 1; //冰光龙诗
const P4_PHASE_CRISTALLIZE_TIME = 2; //二运

const firstDecimalMarker = parseInt("0000", 16);
const getHeadmarkerId = (data, matches) => {
    if (!data.leileiDecOffset) data.leileiDecOffset = parseInt(matches.id, 16) - firstDecimalMarker;
    return (parseInt(matches.id, 16) - data.leileiDecOffset).toString(16).toUpperCase().padStart(4, "0");
};

Options.Triggers.push({
    // zoneId: ZoneId.FuturesRewrittenUltimate,
    //TODO 等常量出了再改
    zoneId: 1238,
    id: "leilei futures rewritten ultimate",
    initData: () => {
        return {
            phase: 0,
            p4_phase: 0,
            p1cloneIdList: [],
            p1fateBreakerPosList: [0, 1, 2, 3, 4, 5, 6, 7],
            p1deleteIndexList: [],
            markingCount: 0,
            p1MarkingList: [],
            p1TFList: [], //p1雷火线
            ddIcicleImpactCount: 0,
            ddIcicleImpactPosition: "",
            ddIceNeedleCount: 0,
            ddIceNeedleFinished: false,
            ddActionContent: "",
            p2_tetherList: [],
            p3_dpsFireList: [],
            p3_tnFireList: [],
            p3_stackGroupDic: { 0: [], 1: [], 2: [], 3: [] },
            p3_stackCount: 0,
            p3_stackFinished: false,
            p4_stackList: [],
            p4_redBuffShortList: [],
            p4_redBuffLongList: [],
            p4_blueBuffList: [],
            p4_darkFlame: 0,
        }
    },
    config: [
        {
            id: "globalMarkEnable",
            comment: {
                cn: "",
                en: "",
                jp: "",
            },
            name: {
                cn: "开启全局标记",
                en: "开启全局标记",
                jp: "开启全局标记",
            },
            type: "checkbox",
            default: false
        }
    ],
    triggers: [
        {
            id: "leilei FRU Headmarker Tracker",
            netRegex: NetRegexes.headMarker({}),
            condition: (data) => undefined === data.leileiDecOffset,
            run: (data, matches) => {
                getHeadmarkerId(data, matches);
            },
        },
        {
            id: "leilei FRU Headmarker debuger",
            netRegex: NetRegexes.headMarker({}),
            run: (data, matches) => {
                const id = getHeadmarkerId(data, matches);
                console.log("FRU headmarker:" + id, "originalId:" + matches.id, "firstDecimalMarker:", firstDecimalMarker);
            },
        },
        {
            id: "leilei FRU 控制战斗阶段",
            netRegex: NetRegexes.startsUsing({ id: ["9CDA", "9CDB", "9D05", "9D4A", "9D2F", "9D6A"] }),
            run: (data, matches) => {
                switch (matches.id) {
                    case "9CDA":
                    case "9CDB":
                        //樂園絕技
                        data.phase = PHASE_FATE_BREAKER;
                        break;
                    case "9D05":
                        //DD
                        data.phase = PHASE_USURPER_OF_FROST;
                        break;
                    case "9D4A":
                        //p3一运
                        data.phase = PHASE_ORACLE_OF_DARKNESS;
                        break;
                    case "9D2F":
                        //p4 冰光龙诗
                        data.phase = PHASE_ENTER_THE_DRAGON;
                        data.p4_phase = P4_PHASE_DRAGON_SONG;
                        break;
                    case "9D6A":
                        //p4 二运
                        data.p4_phase = P4_PHASE_CRISTALLIZE_TIME;
                        break;
                    default:
                        break;
                }
                console.log("phase", data.phase);
            }
        },
        {
            id: "leilei FRU P1 雾龙阶段分身列表",
            /**
             * 分身生成规律
             * 生成16个分身
             * 先生成一个场中(100,100,)分身，id为0，再从场地西南方开始逆时针依次场外8方的分身
             * 生成中场分身，id为0，生成西南分身，id为1
             * 生成中场分身，id为2，生成南分身，id为3
             * 生成中场分身，id为4，生成东南分身，id为5
             * 生成中场分身，id为6，生成东分身，id为7
             * 生成中场分身，id为8，生成东北分身，id为9
             * 生成中场分身，id为10，生成北分身，id为11
             * 生成中场分身，id为12，生成西北分身，id为13
             * 生成中场分身，id为14，生成西分身，id为15
             * 顺序：西南-南-东南-东-东北-北-西北-西
             * 
             * 索引a分身读条控制索引a + 1分身释放直线aoe爆破领域
             */

            netRegex: NetRegexes.gainsEffect({ effectId: "655" }),
            run: (data, matches) => {
                data.p1cloneIdList.push(parseInt(matches.targetId, 16));
                data.p1cloneIdList.push(parseInt(matches.targetId, 16) - 1);

                if (data.p1cloneIdList.length === 16) {
                    data.p1cloneIdList = data.p1cloneIdList.sort((a, b) => a - b).map(item => item.toString(16).toUpperCase());
                }
            },
        },
        {
            id: "leilei FRU P1 雾龙安全点",
            netRegex: NetRegexes.startsUsing({ id: "9CDE" }),

            preRun: (data, matches) => {
                let index = data.p1cloneIdList.indexOf(matches.sourceId);
                if (index < 8) {
                    data.p1deleteIndexList.push(index / 2);
                    data.p1deleteIndexList.push(index / 2 + 4);
                } else {
                    data.p1deleteIndexList.push(index / 2);
                    data.p1deleteIndexList.push(index / 2 - 4);
                }

                if (data.p1deleteIndexList.length === 6) {
                    data.p1deleteIndexList.sort((a, b) => b - a).forEach(index => {
                        data.p1fateBreakerPosList.splice(index, 1);
                    });
                }
            },

            infoText: (data, matches, output) => {
                if (data.p1fateBreakerPosList.length === 2) {
                    return output[`${convertFateBreakerMarker(data.p1fateBreakerPosList.map(item => item.toString()).join(''))}`]();
                }
            },
            outputStrings: {
                正北正南: "AC安全",
                西北东南: "二四安全",
                正西正东: "BD安全",
                东北西南: "一三安全",
            },
        },
        {
            id: "leilei FRU p1 4连雷火线 标记",
            netRegex: NetRegexes.gainsEffect({ effectId: "41B" }),
            infoText: "",
            condition: (data) => {
                return data.markingCount < 6;
            },
            run: (data, matches, output) => {
                data.markingCount++;
                if (data.markingCount <= 2) {
                    //前两个是雾龙阶段的两个连线
                    data.p1MarkingList.push(matches.targetId);
                    if (data.p1MarkingList.length < 2) {
                        return;
                    }

                    const target1 = data.p1MarkingList[0];
                    const target2 = data.p1MarkingList[1];
                    data.p1MarkingList = [];

                    if (!isMarkEnable(data, output)) {
                        return;
                    }

                    const rpGroup1 = ["MT", "H1", "D1", "D3"];
                    const rpGroup2 = ["ST", "H2", "D2", "D4"];
                    const rp1 = data.leileiFL.getRpByHexId(data, target1);
                    const rp2 = data.leileiFL.getRpByHexId(data, target2);
                    if (rpGroup1.includes(rp1) !== rpGroup1.includes(rp2)) {
                        //不同组 无事发生
                        return;
                    }

                    //随便标一个
                    data.leileiFL.mark(target1, data.leileiData.targetMarkers.attack1);
                    //标另一组的D2/3
                    const targetRp = rpGroup1.includes(rp1) ? "D2" : "D3";
                    data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, targetRp), data.leileiData.targetMarkers.bind1);
                    setTimeout(() => {
                        data.leileiFL.clearMark();
                    }, 10000);
                    return;
                }

                data.p1MarkingList.push(matches.targetId);

                if (!isMarkEnable(data, output)) {
                    return;
                }


                if (!data.triggerSetConfig.globalMarkEnable) {
                    return;
                }

                /**
                 * 4个连线，锁链12禁止12
                 * 锁链12去A，禁止12去C
                 */
                let markType;
                switch (data.markingCount) {
                    case 3:
                        markType = data.leileiData.targetMarkers.bind1;
                        break;
                    case 4:
                        markType = data.leileiData.targetMarkers.stop1;
                        break;
                    case 5:
                        markType = data.leileiData.targetMarkers.bind2;
                        break;
                    case 6:
                        markType = data.leileiData.targetMarkers.stop2;
                        break;
                }

                if (output.是否标记连线().toLowerCase() === "true") {
                    data.leileiFL.mark(matches.targetId, markType);
                }

                if (data.p1MarkingList.length === 4) {
                    if (output.是否标记闲人().toLowerCase() !== "true") {
                        return;
                    }

                    /**
                     * 4个无点名，攻击1234
                     * 攻击12去A，攻击34去C
                     */
                    const otherList = data.party.partyIds_.filter((v) => {
                        return !data.p1MarkingList.includes(v);
                    });

                    const rpRuleList = output.优先级().split("/");
                    otherList.sort((a, b) => {
                        return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                    });

                    data.leileiFL.mark(otherList[0], data.leileiData.targetMarkers.attack1);
                    data.leileiFL.mark(otherList[1], data.leileiData.targetMarkers.attack2);
                    data.leileiFL.mark(otherList[2], data.leileiData.targetMarkers.attack3);
                    data.leileiFL.mark(otherList[3], data.leileiData.targetMarkers.attack4);

                    setTimeout(() => {
                        data.leileiFL.clearMark();
                    }, 20000);
                }
            },
            outputStrings: {
                优先级: "H1/MT/ST/D1/D2/D3/D4/H2",
                是否标记连线: "false",
                是否标记闲人: "false",
                是否标记: "false"
            }
        },
        {
            id: "leilei FRU p1 4连雷火线 小队播报",
            //9CC9 火
            //9CCC 雷
            netRegex: NetRegexes.startsUsing({ id: ["9CC9", "9CCC"] }),
            preRun: (data, matches, output) => {
                const result = matches.id === "9CC9" ? output.火() : output.雷();
                data.p1TFList.push(result);
            },
            infoText: (data) => {
                const len = data.p1TFList.length;
                return len + data.p1TFList[len - 1];
            },
            run: (data, matches, output) => {
                if (data.p1TFList.length === 4) {
                    const channel = isMarkEnable(data, output) ? "/p" : "/e";
                    data.leileiFL.doTextCommand(channel + " " + data.p1TFList.join(" ") + "<se.4>");
                    data.leileiFL.doTextCommand(channel + " A:" + data.p1TFList[0] + "" + data.p1TFList[2]);
                    data.leileiFL.doTextCommand(channel + " C:" + data.p1TFList[1] + "" + data.p1TFList[3]);

                    setTimeout(() => {
                        if (data.p1TFList[0] === data.p1TFList[2]) {
                            data.leileiFL.doTextCommand(channel + " A点換位");
                        }

                        if (data.p1TFList[1] === data.p1TFList[3]) {
                            data.leileiFL.doTextCommand(channel + " C点換位");
                        }
                    }, 1000);
                }
            },
            durationSeconds: 25,
            outputStrings: {
                雷: "雷",
                火: "火",
                是否标记: "false"
            }
        },
        {
            id: "leilei FRU p1 乐园绝技",
            //9CDA 火
            //9CDB 雷
            netRegex: NetRegexes.startsUsing({ id: ["9CDA", "9CDB"] }),
            infoText: (data, matches, output) => {
                return matches.id === "9CDA" ? output.火() : output.雷();
            },
            durationSeconds: 20,
            outputStrings: {
                雷: "雷雷雷",
                火: "火火火",
            }
        },
        {
            id: "leilei FRU p2 DD钢铁月环",
            //9D0A 钢铁
            //9D0B 月环
            netRegex: NetRegexes.startsUsing({ id: ["9D0A", "9D0B"] }),
            infoText: (data, matches, output) => {
                return matches.id === "9D0A" ? output.钢铁() : output.月环();
            },
            run: (data, matches, output) => {
                data.ddActionContent = matches.id === "9D0A" ? output.钢铁() : output.月环();
            },
            outputStrings: {
                钢铁: "钢铁",
                月环: "月环",
            }
        },
        {
            id: "leilei FRU p2 DD初始冰圈位置",
            disabled: true, //误差太大了，不报了
            netRegex: NetRegexes.startsUsing({ id: "9D06" }),
            condition: (data, matches) => {
                if (data.ddIceNeedleFinished) {
                    return false;
                }

                const x = matches.x;
                const y = matches.y;
                console.log(data.ddIcicleImpactCount, x, y);

                if (data.ddIcicleImpactPosition !== "") {
                    //一般来说第一次就已经拿到数据了，但是可能会有误差特别大的（比如10）拿不到数据，这时候尝试拿第二个
                    return false;
                }

                //只要前两个冰圈的位置，后面的一律不管
                return data.ddIcicleImpactCount < 2;
            },
            preRun: (data, matches) => {
                data.ddIcicleImpactCount++;

                /**
                 * AC冰圈:100.00:84.00,100.00:116.00
                 * BD冰圈:84.00:100.00,116.00:100.00
                 * 13冰圈:88.69:88.69,111.31:111.31
                 * 24冰圈:88.69:111.31,111.31:88.69
                 */
                const x = matches.x;
                const y = matches.y;
                if (checkPosition(x, y, 100, 84) || checkPosition(x, y, 100, 116)) {
                    //AC
                    data.ddIcicleImpactPosition = "AC";
                } else if (checkPosition(x, y, 84, 100) || checkPosition(x, y, 116, 100)) {
                    //BD
                    data.ddIcicleImpactPosition = "BD";
                } else if (checkPosition(x, y, 88.69, 88.69) || checkPosition(x, y, 111.31, 111.31)) {
                    //13
                    data.ddIcicleImpactPosition = "13";
                } else if (checkPosition(x, y, 88.69, 111.31) || checkPosition(x, y, 111.31, 111.31)) {
                    //24
                    data.ddIcicleImpactPosition = "24";
                }
            },
            infoText: (data, matches, output) => {
                data.ddIceNeedleFinished = true;
                return output[`${convertFieldMarker(data.ddIcicleImpactPosition)}`]();
            },
            delaySeconds: 8,
            durationSeconds: 5,
            outputStrings: {
                正北正南: "AC击退",
                正西正东: "BD击退",
                西北东南: "一三击退",
                东北西南: "二四击退",
            }
        },
        {
            id: "leilei FRU p2 DD冰花点名",
            disabled: true, //误差太大了，不报了
            netRegex: NetRegexes.headMarker({}),
            condition: (data) => {
                //只要随便拿一个就行了
                return data.ddIceNeedleCount < 1;
            },
            infoText: (data, matches, output) => {
                const id = getHeadmarkerId(data, matches);
                if (id !== headMarker.iceNeedle) {
                    return;
                }

                data.ddIceNeedleCount++;
                const targetIsDps = data.leileiFL.isDpsByHexId(data, matches.targetId);
                const iAmDps = data.leileiFL.isDpsByName(data, data.me);

                //这时候冰圈位置已经有了，直接报[正/斜点][引导/冰花]
                let pos;
                let action;
                //是否是正点冰圈
                const isAlphaMarker = data.ddIcicleImpactPosition === "AC" || data.ddIcicleImpactPosition === "BD";
                if (targetIsDps !== iAmDps) {
                    //诱导组
                    pos = isAlphaMarker ? "正" : "斜";
                    action = "引导";
                } else {
                    //冰花组
                    pos = isAlphaMarker ? "斜" : "正";
                    action = "放冰花";
                }

                data.ddActionContent += "," + output.content({
                    pos: pos,
                    action: action
                });
                return data.ddActionContent;
            },
            outputStrings: {
                content: "${pos}点${action}"
            }
        },
        {
            id: "leilei FRU p2 DD闲前静后",
            //9D01 静后
            //9D02 闲前
            netRegex: NetRegexes.startsUsing({ id: ["9D01", "9D02"] }),
            infoText: (data, matches, output) => {
                return matches.id === "9D02" ? output.闲前() : output.静后();
            },
            outputStrings: {
                闲前: "先去正面",
                静后: "先去背面",
            }
        },
        {
            id: "leilei FRU p2 强放逐",
            //9D1C 分摊
            //9D1D 分散
            netRegex: NetRegexes.startsUsing({ id: ["9D1C", "9D1D"] }),
            infoText: (data, matches, output) => {
                return matches.id === "9D1C" ? output.分摊() : output.分散();
            },
            outputStrings: {
                分摊: "分摊分摊",
                分散: "分散分散",
            }
        },
        {
            id: "leilei FRU p2 光爆连线",
            netRegex: NetRegexes.tether({}),
            condition: (data) => {
                return data.phase === PHASE_USURPER_OF_FROST && data.p2_tetherList.length < 6;
            },
            preRun: (data, matches) => {
                [matches.sourceId, matches.targetId].forEach(v => {
                    if (!data.p2_tetherList.includes(v)) {
                        data.p2_tetherList.push(v);
                    }
                });
            },
            infoText: (data, matches, output) => {
                if (data.p2_tetherList.length < 6) {
                    return;
                }

                //考虑是否换位
                const myRp = data.leileiFL.getRpByName(data, data.me);
                let dpsRp;
                let tnRp;
                const isChangeRole = output.换位成员().split("/").filter(v => {
                    if (v === "D1" || v === "D2" || v === "D3" || v === "D4") {
                        dpsRp = v;
                    } else {
                        tnRp = v;
                    }
                    return v === myRp;
                }).length > 0;
                if (isChangeRole) {
                    let dpsCount = 0;
                    data.p2_tetherList.forEach(v => {
                        if (data.leileiFL.isDpsByHexId(data, v)) {
                            dpsCount++;
                        }
                    });

                    if (dpsCount !== 3) {
                        return output.换位提示({ rp: dpsCount === 2 ? tnRp : dpsRp });
                    }
                }
            },
            run: (data, matches, output) => {
                if (!isMarkEnable(data, output)) {
                    return;
                }

                if (data.p2_tetherList.length < 6) {
                    return;
                }

                //闲人
                const otherList = data.party.partyIds_.filter(v => {
                    return !data.p2_tetherList.includes(v);
                });
                const rpRuleList = output.优先级().split("/");
                otherList.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });

                /**
                 * 高优先级闲人锁链1
                 * 低优先级闲人锁链2
                 */
                data.leileiFL.mark(otherList[0], data.leileiData.targetMarkers.bind1);
                data.leileiFL.mark(otherList[1], data.leileiData.targetMarkers.bind2);

                setTimeout(() => {
                    data.leileiFL.clearMark();
                }, 8000);
            },
            outputStrings: {
                优先级: "MT/ST/H1/H2/D1/D2/D3/D4",
                换位成员: "D4/H2",
                换位提示: "${rp}换位",
                是否标记: "false"
            }
        },
        {
            id: "leilei FRU p2.5 暗水晶引导",
            netRegex: NetRegexes.startsUsing({ id: "9D46" }),
            condition: (data) => {
                return data.leileiFL.isRanged(data.leileiFL.getRpByName(data, data.me));
            },
            infoText: (data, matches, output) => {
                return output.content();
            },
            suppressSeconds: 1,
            outputStrings: {
                content: "动动动",
            }
        },
        {
            /**
             * 997 火
             */
            id: "leilei FRU p3 灰九式一运 优先级标记",
            netRegex: NetRegexes.gainsEffect({ effectId: "997" }),
            infoText: "",
            run: (data, matches, output) => {
                if (!isMarkEnable(data, output)) {
                    return;
                }

                const rpRuleList = output.优先级().split("/");
                if (matches.duration == 11 && data.leileiFL.isDpsByHexId(data, matches.targetId)) {
                    //DPS 短火
                    data.p3_dpsFireList.push(matches.targetId);
                    if (data.p3_dpsFireList.length === 2) {
                        data.p3_dpsFireList.sort((a, b) => {
                            return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                        });

                        data.leileiFL.mark(data.p3_dpsFireList[0], data.leileiData.targetMarkers.bind1);
                        data.leileiFL.mark(data.p3_dpsFireList[1], data.leileiData.targetMarkers.bind2);
                    }
                } else if (matches.duration == 31 && !data.leileiFL.isDpsByHexId(data, matches.targetId)) {
                    data.p3_tnFireList.push(matches.targetId);
                    if (data.p3_tnFireList.length === 2) {
                        data.p3_tnFireList.sort((a, b) => {
                            return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                        });

                        data.leileiFL.mark(data.p3_tnFireList[0], data.leileiData.targetMarkers.stop1);
                        data.leileiFL.mark(data.p3_tnFireList[1], data.leileiData.targetMarkers.stop2);

                        setTimeout(() => {
                            data.leileiFL.clearMark();
                        }, 35000);
                    }
                }
            },
            outputStrings: {
                优先级: "MT/ST/H1/H2/D1/D2/D3/D4",
                是否标记: "false"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 10s火&tn冰 方位播报",
            durationSeconds: 35,
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && !data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 11));
            },
            infoText: (data, matches, output) => {
                return data.leileiFL.isDpsByName(data, data.me) ? output.dps() : output.tn();
            },
            outputStrings: {
                dps: "左上右上",
                tn: "正下"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 10s火&tn冰 action1",
            netRegex: NetRegexes.gainsEffect({ effectId: "997" }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me && matches.duration == 11;
            },
            delaySeconds: 3,
            infoText: (data, matches, output) => {
                return output.放火();
            },
            outputStrings: {
                放火: "出去放火"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 10s火&tn冰 action2",
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && !data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 11));
            },
            delaySeconds: 11,
            infoText: (data, matches, output) => {
                return output.回溯();
            },
            outputStrings: {
                回溯: "去灯下放回溯"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 10s火&tn冰 action3",
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && !data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 11));
            },
            delaySeconds: 16,
            infoText: (data, matches, output) => {
                return output.分摊();
            },
            outputStrings: {
                分摊: "去中间分摊"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 10s火&tn冰 action4",
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && !data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 11));
            },
            delaySeconds: 21,
            infoText: (data, matches, output) => {
                return output.引导();
            },
            outputStrings: {
                引导: "去灯边引导"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 10s火&tn冰 action5",
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && !data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 11));
            },
            delaySeconds: 26,
            infoText: (data, matches, output) => {
                return output.分摊();
            },
            outputStrings: {
                分摊: "去中间分摊"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 10s火&tn冰 action6",
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && !data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 11));
            },
            delaySeconds: 36,
            infoText: (data, matches, output) => {
                return output.分散();
            },
            outputStrings: {
                分散: "面向场外分散"
            }
        },
        {
            /**
             * 997 火
             */
            id: "leilei FRU p3 灰九式一运 20s火 方位播报",
            durationSeconds: 35,
            netRegex: NetRegexes.gainsEffect({ effectId: "997" }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me && matches.duration == 21;
            },
            infoText: (data, matches, output) => {
                return data.leileiFL.isDpsByName(data, data.me) ? output.dps() : output.tn();
            },
            outputStrings: {
                dps: "正右",
                tn: "正左"
            }
        },
        {
            /**
             * 997 火
             */
            id: "leilei FRU p3 灰九式一运 20s火 action1",
            netRegex: NetRegexes.gainsEffect({ effectId: "997" }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me && matches.duration == 21;
            },
            delaySeconds: 11,
            infoText: (data, matches, output) => {
                return data.leileiFL.isDpsByName(data, data.me) ? output.dps() : output.tn();
            },
            outputStrings: {
                dps: "往场外走一步放回溯",
                tn: "去灯下放回溯",
            }
        },
        {
            /**
             * 997 火
             */
            id: "leilei FRU p3 灰九式一运 20s火 action2",
            netRegex: NetRegexes.gainsEffect({ effectId: "997" }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me && matches.duration == 21;
            },
            delaySeconds: 16,
            infoText: (data, matches, output) => {
                return output.放火();
            },
            outputStrings: {
                放火: "出去放火"
            }
        },
        {
            /**
             * 997 火
             */
            id: "leilei FRU p3 灰九式一运 20s火 action3",
            netRegex: NetRegexes.gainsEffect({ effectId: "997" }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me && matches.duration == 21;
            },
            delaySeconds: 21,
            infoText: (data, matches, output) => {
                return output.分摊();
            },
            outputStrings: {
                分摊: "去中间分摊"
            }
        },
        {
            /**
             * 997 火
             */
            id: "leilei FRU p3 灰九式一运 20s火 action4",
            netRegex: NetRegexes.gainsEffect({ effectId: "997" }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me && matches.duration == 21;
            },
            delaySeconds: 31,
            infoText: (data, matches, output) => {
                return output.引导();
            },
            outputStrings: {
                引导: "去灯边引导"
            }
        },
        {
            /**
             * 997 火
             */
            id: "leilei FRU p3 灰九式一运 20s火 action5",
            netRegex: NetRegexes.gainsEffect({ effectId: "997" }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me && matches.duration == 21;
            },
            delaySeconds: 36,
            infoText: (data, matches, output) => {
                return output.分散();
            },
            outputStrings: {
                分散: "回场中，面向场外分散"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 30s火&dps冰 方位播报",
            durationSeconds: 35,
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 31));
            },
            infoText: (data, matches, output) => {
                return data.leileiFL.isDpsByName(data, data.me) ? output.dps() : output.tn();
            },
            outputStrings: {
                dps: "正上",
                tn: "左下右下"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 30s火&dps冰 action1",
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 31));
            },
            delaySeconds: 11,
            infoText: (data, matches, output) => {
                return output.引导();
            },
            outputStrings: {
                引导: "去灯边引导"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 30s火&dps冰 action2",
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 31));
            },
            delaySeconds: 16,
            infoText: (data, matches, output) => {
                return output.分摊();
            },
            outputStrings: {
                分摊: "去中间分摊"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 30s火&dps冰 action3",
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 31));
            },
            delaySeconds: 21,
            infoText: (data, matches, output) => {
                return output.回溯();
            },
            outputStrings: {
                回溯: "往场外走一步放回溯"
            }
        },
        {
            /**
             * 997 火
             */
            id: "leilei FRU p3 灰九式一运 30s火&dps冰 action4",
            netRegex: NetRegexes.gainsEffect({ effectId: "997" }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me && matches.duration == 31;
            },
            delaySeconds: 26,
            infoText: (data, matches, output) => {
                return output.放火();
            },
            outputStrings: {
                放火: "出去放火"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 30s火&dps冰 action5",
            netRegex: NetRegexes.gainsEffect({ effectId: "997" }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }
                return matches.target === data.me
                    && ((matches.effectId === "99E" && data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 31));
            },
            delaySeconds: 31,
            infoText: (data, matches, output) => {
                return output.待机();
            },
            outputStrings: {
                待机: "回场中"
            }
        },
        {
            /**
             * 997 火
             * 99E 冰
             */
            id: "leilei FRU p3 灰九式一运 30s火&dps冰 action6",
            netRegex: NetRegexes.gainsEffect({ effectId: ["997", "99E"] }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }

                return matches.target === data.me
                    && ((matches.effectId === "99E" && data.leileiFL.isDpsByName(data, data.me)) || (matches.effectId === "997" && matches.duration == 31));
            },
            delaySeconds: 36,
            infoText: (data, matches, output) => {
                return output.分散();
            },
            outputStrings: {
                分散: "面向场外分散"
            }
        },
        {
            id: "leilei FRU p3 地火分组 标记",
            netRegex: NetRegexes.gainsEffect({ effectId: "99D" }),
            condition: (data, matches) => {
                if (data.phase !== PHASE_ORACLE_OF_DARKNESS) {
                    return false;
                }

                if (data.p3_stackFinished) {
                    return false;
                }
                return matches.duration == 10 || matches.duration == 29 || matches.duration == 38;
            },
            infoText: "",
            preRun: (data, matches, output) => {
                let group;
                switch (parseInt(matches.duration)) {
                    case 10:
                        group = 1;
                        break;
                    case 29:
                        group = 2;
                        break;
                    case 38:
                        group = 3;
                        break;
                    default:
                        break;
                }

                data.p3_stackCount++;
                data.p3_stackGroupDic[group].push(matches.targetId);

                if (data.p3_stackCount === 6) {
                    //无分摊
                    const stackList = data.p3_stackGroupDic[1].concat(data.p3_stackGroupDic[2]).concat(data.p3_stackGroupDic[3]);
                    data.p3_stackGroupDic[0] = data.party.partyIds_.filter(v => {
                        return !stackList.includes(v);
                    });
                }
            },
            run: (data, matches, output) => {
                if (data.p3_stackCount < 6) {
                    return;
                }

                if (!isMarkEnable(data, output)) {
                    return;
                }

                let rpRuleList = output.左右分组优先级().split("/");
                //tn组左，dps组右
                let group1 = [];
                let group2 = [];
                for (let group = 0; group < 4; group++) {
                    const list = data.p3_stackGroupDic[group];
                    const id1 = list[0];
                    const id2 = list[1];
                    const isDps1 = data.leileiFL.isDpsByHexId(data, id1);
                    const isDps2 = data.leileiFL.isDpsByHexId(data, id2);

                    if (isDps1 === isDps2) {
                        list.sort((a, b) => {
                            return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                        });
                        //优先级高的去对面
                        if (data.leileiFL.isDpsByHexId(data, list[0])) {
                            //dps组，高的左低的右
                            group1.push(list[0]);
                            group2.push(list[1]);
                        } else {
                            //tn组，高的右低的左
                            group2.push(list[0]);
                            group1.push(list[1]);
                        }
                    } else {
                        group1.push(!isDps1 ? id1 : id2);
                        group2.push(isDps1 ? id1 : id2);
                    }
                }

                rpRuleList = output.组内优先级().split("/");
                group1.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });
                group2.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });

                //左边组
                data.leileiFL.mark(group1[0], data.leileiData.targetMarkers.bind1);
                data.leileiFL.mark(group1[1], data.leileiData.targetMarkers.bind2);
                data.leileiFL.mark(group1[2], data.leileiData.targetMarkers.stop1);
                data.leileiFL.mark(group1[3], data.leileiData.targetMarkers.stop2);

                //右边组
                data.leileiFL.mark(group2[0], data.leileiData.targetMarkers.attack1);
                data.leileiFL.mark(group2[1], data.leileiData.targetMarkers.attack2);
                data.leileiFL.mark(group2[2], data.leileiData.targetMarkers.attack3);
                data.leileiFL.mark(group2[3], data.leileiData.targetMarkers.attack4);

                setTimeout(() => {
                    data.leileiFL.clearMark();
                }, 38000);

                data.p3_stackFinished = true;
            },
            outputStrings: {
                左右分组优先级: "MT/ST/H1/H2/D1/D2/D3/D4",
                组内优先级: "D1/D2/MT/ST/D3/D4/H1/H2",
                是否标记: "false"
            }
        },
        {
            id: "leilei FRU p4 光暗龙诗 水分摊标记",
            /**
             * 99D 水分摊
             */
            netRegex: NetRegexes.gainsEffect({ effectId: "99D" }),
            infoText: "",
            condition: (data) => {
                return data.p4_phase === P4_PHASE_DRAGON_SONG;
            },
            preRun: (data, matches) => {
                data.p4_stackList.push(matches.targetId);
            },
            run: (data, matches, output) => {
                if (!isMarkEnable(data, output)) {
                    return;
                }

                if (data.p4_stackList.length < 2) {
                    return;
                }

                data.leileiFL.mark(data.p4_stackList[0], data.leileiData.targetMarkers.stop1);
                data.leileiFL.mark(data.p4_stackList[1], data.leileiData.targetMarkers.stop2);

                setTimeout(() => {
                    data.leileiFL.clearMark();
                }, 20000);
            },
            outputStrings: {
                是否标记: "false"
            }
        },
        {
            id: "leilei FRU p4 二运 红蓝buff标记",
            /**
             * CC0 蓝buff
             * CBF 红buff
             * 99C 暗火分散
             */
            netRegex: NetRegexes.gainsEffect({ effectId: ["CC0", "CBF", "99C"] }),
            infoText: "",
            condition: (data) => {
                return data.phase === PHASE_ENTER_THE_DRAGON;
            },
            preRun: (data, matches, output) => {
                if (matches.effectId === "CC0") {
                    data.p4_blueBuffList.push(matches.targetId);
                } else if (matches.effectId === "CBF") {
                    if (parseInt(matches.duration) === 40) {
                        data.p4_redBuffLongList.push(matches.targetId);
                    } else {
                        data.p4_redBuffShortList.push(matches.targetId);
                    }
                } else if (matches.effectId === "99C") {
                    data.p4_darkFlame = matches.targetId;
                }
            },
            run: (data, matches, output) => {
                /**
                 * 短红锁链12,
                 * 长红禁止12
                 * 暗火蓝攻击1
                 * 剩下蓝234
                 * 攻击1234吃BD34
                 */
                if (!isMarkEnable(data, output)) {
                    return;
                }

                if (data.p4_blueBuffList.length < 4 || data.p4_redBuffLongList.length < 2 || data.p4_redBuffShortList.length < 2 || data.p4_darkFlame === 0) {
                    //数据还没收集齐
                    return;
                }

                //暗火蓝buff固定点1
                const list = data.p4_blueBuffList.filter(v => {
                    return v !== data.p4_darkFlame;
                });

                const rpRuleList = output.优先级().split("/");
                data.p4_redBuffLongList.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });
                data.p4_redBuffShortList.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });
                data.p4_blueBuffList.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });

                data.leileiFL.mark(data.p4_darkFlame, data.leileiData.targetMarkers.attack1);
                data.leileiFL.mark(list[0], data.leileiData.targetMarkers.attack2);
                data.leileiFL.mark(list[1], data.leileiData.targetMarkers.attack3);
                data.leileiFL.mark(list[2], data.leileiData.targetMarkers.attack4);

                data.leileiFL.mark(data.p4_redBuffShortList[0], data.leileiData.targetMarkers.bind1);
                data.leileiFL.mark(data.p4_redBuffShortList[1], data.leileiData.targetMarkers.bind2);

                data.leileiFL.mark(data.p4_redBuffLongList[0], data.leileiData.targetMarkers.stop1);
                data.leileiFL.mark(data.p4_redBuffLongList[1], data.leileiData.targetMarkers.stop2);

                setTimeout(() => {
                    data.leileiFL.clearMark();
                }, 45000);
            },
            outputStrings: {
                优先级: "MT/ST/H1/H2/D1/D2/D3/D4",
                是否标记: "false"
            }
        },
        {
            id: "leilei FRU p4 二运 蓝buff播报",
            /**
             * 99C 暗火分散
             * CC0 蓝buff
             */
            netRegex: NetRegexes.gainsEffect({ effectId: ["99C", "CC0"] }),
            condition: (data, matches) => {
                return data.phase === PHASE_ENTER_THE_DRAGON;
            },
            infoText: (data, matches, output) => {
                if (data.p4_blueBuffList.length < 4 || data.p4_darkFlame === 0) {
                    //数据还没收集齐
                    return;
                }

                const myId = data.leileiFL.getHexIdByName(data, data.me);
                if (!data.p4_blueBuffList.includes(myId)) {
                    //自己是红buff
                    return null;
                }

                if (data.p4_darkFlame === myId) {
                    return output.暗火();
                } else {
                    return output.非暗火();
                }
            },
            outputStrings: {
                暗火: "去北边找蓝灯",
                非暗火: "去南边找蓝灯",
            }
        },
        {
            id: "leilei FRU p4 二运 短红buff播报",
            /**
             * CBF 红buff
             */
            netRegex: NetRegexes.gainsEffect({ effectId: "CBF" }),
            condition: (data, matches) => {
                return matches.target === data.me && parseInt(matches.duration) !== 40;
            },
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                content: "去左右撞龙头"
            }
        },
        {
            id: "leilei FRU p4 二运 长红buff播报",
            /**
             * CBF 红buff
             */
            netRegex: NetRegexes.gainsEffect({ effectId: "CBF" }),
            condition: (data, matches) => {
                return matches.target === data.me && parseInt(matches.duration) === 40;
            },
            infoText: (data, matches, output) => {
                return output.content();
            },
            outputStrings: {
                content: "去南边放风"
            }
        },
    ]
})
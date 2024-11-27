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
    return data.triggerSetConfig.globalMarkConfig && output.是否标记().toLowerCase() === "true";
}

const headMarker = {
    iceNeedle: "007F", //冰花
}

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
            markingCount: 0,
            p1MarkingList: [],
            ddIcicleImpactCount: 0,
            ddIcicleImpactPosition: "",
            ddIceNeedleCount: 0,
            ddActionContent: "",
        }
    },
    config: [
        {
            id: "globalMarkConfig",
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
            id: "leilei FRU p1 4连连线",
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
                    if (rpGroup1.includes(rp1) != rpGroup1.includes(rp2)) {
                        //不同组 无事发生
                        return;
                    }

                    //随便标一个
                    data.leileiFL.mark(target1, data.leileiData.targetMarkers.attack1);
                    //标另一组的D2/3
                    const targerRp = rpGroup1.includes(rp1) ? "D2" : "D3";
                    data.leileiFL.mark(data.leileiFL.getHexIdByRp(data, targerRp), data.leileiData.targetMarkers.bind1);
                    console.log("点名：", rp1, rp2, "换位：", rp1, targerRp);
                    setTimeout(() => {
                        data.leileiFL.clearMark();
                    }, 10000);
                    return;
                }

                data.p1MarkingList.push(matches.targetId);

                if (!isMarkEnable(data, output)) {
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

                data.leileiFL.mark(matches.targetId, markType);

                if (data.p1MarkingList.length == 4) {
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
            durationSeconds: 15,
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
            outputStrings: {
                钢铁: "钢铁钢铁",
                月环: "月环月环",
            }
        },
        {
            id: "leilei FRU p2 DD初始冰圈位置",
            netRegex: NetRegexes.startsUsing({ id: "9D06" }),
            condition: (data) => {
                //只要第一个冰圈的位置，后面的一律不管
                return data.ddIcicleImpactCount < 1;
            },
            preRun: (data, matches, output) => {
                data.ddIcicleImpactCount++;

                /**
                 * AC冰圈:100.00:84.00,100.00:116.00
                 * BD冰圈:84.00:100.00,116.00:100.00
                 * 13冰圈:88.69:88.69,111.31:111.31
                 * 24冰圈:88.69:111.31,111.31:88.69
                 */
                const x = matches.x;
                const y = matches.y;
                if (x == 100 && y == 84 || x == 100 && y == 116) {
                    //AC
                    data.ddIcicleImpactPosition = "AC";
                } else if (x == 84 && y == 100 || x == 116 && y == 100) {
                    //BD
                    data.ddIcicleImpactPosition = "BD";
                } else if (x == 88.69 && y == 88.69 || x == 111.31 && y == 111.31) {
                    //13
                    data.ddIcicleImpactPosition = "13";
                } else if (x == 88.69 && y == 111.31 || x == 111.31 && y == 88.69) {
                    //24
                    data.ddIcicleImpactPosition = "24";
                }
            },
            infoText: (data, matches, output) => {
                return output[`${data.ddIcicleImpactPosition}`]();
            },
            delaySeconds: 8,
            outputStrings: {
                AC: "AC击退",
                BD: "BD击退",
                13: "13击退",
                24: "24击退",
            }
        },
        {
            id: "leilei FRU p2 DD冰花点名",
            netRegex: NetRegexes.headMarker({}),
            condition: (data) => {
                //只要随便拿一个就行了
                return data.ddIceNeedleCount < 1;
            },
            preRun: (data, matches, output) => {
                const id = getHeadmarkerId(data, matches);
                if (id !== headMarker.iceNeedle) {
                    return;
                }

                data.ddIceNeedleCount++;
                const rp = data.leileiFL.getRpByHexId(data, matches.targetId);
                let targetIsDps = true;
                if (rp === "MT" || rp === "ST" || rp === "H1" || rp === "H2") {
                    targetIsDps = false;
                }

                const myRp = data.leileiFL.getRpByName(data, data.me);
                let iAmDps = true;
                if (myRp === "MT" || myRp === "ST" || myRp === "H1" || myRp === "H2") {
                    iAmDps = false;
                }

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

                data.ddActionContent = output.content({
                    pos: pos,
                    action: action
                });
            },
            delaySeconds: 2, //先让钢铁月环报完
            infoText: (data) => {
                return data.ddActionContent;
            },
            outputStrings: {
                content: "${pos}点${action}"
            }
        },
    ]
})
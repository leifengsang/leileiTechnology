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

Options.Triggers.push({
    // zoneId: ZoneId.FuturesRewrittenUltimate,
    //TODO 等常量出了再改
    zoneId: 1238,
    id: "leilei futures rewritten ultimate",
    initData: () => {
        return {
            markingCount: 0,
            p1MarkingList: [],
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
    triggers: [{
        id: "leilei FRU p1 4连连线",
        netRegex: NetRegexes.gainsEffect({ effectId: "41B" }),
        infoText: "",
        condition: (data) => {
            return data.markingCount <= 6;
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
                 * 雷引导，数字小的在左边，数字大的在右边（A基准）
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
    ]
})
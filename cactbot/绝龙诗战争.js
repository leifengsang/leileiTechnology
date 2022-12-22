/**
 * 绝龙诗 P6标记
 */

Options.Triggers.push({
    zoneId: ZoneId.DragonsongsRepriseUltimate,
    initData: () => {
        return {
            markCount: 0,
            blackList: [],
            whiteList: [],
        }
    },
    triggers: [
        {
            id: "leilei 黑白点名",
            netRegex: NetRegexes.gainsEffect({ effectId: "AC[67]" }),
            run: (data, matches, output) => {
                if (matches.id === "AC6") {
                    data.blackList.push(matches.targetId);
                } else {
                    data.whileList.push(matches.targetId);
                }

                data.markCount++;
                if (output.标点 === "true" && data.markCount == 6) {
                    data.leileiFL.clearMark();

                    let nullList = data.party.details.filter((v) => {
                        return !(data.blackList.includes(v.id) || data.whileList.includes(v.id));
                    });
                    data.leileiFL.mark(data.blackList[0], data.leileiData.targetMakers.attack1);
                    data.leileiFL.mark(data.blackList[1], data.leileiData.targetMakers.attack2);
                    data.leileiFL.mark(data.blackList[2], data.leileiData.targetMakers.attack3);
                    data.leileiFL.mark(data.blackList[3], data.leileiData.targetMakers.attack4);

                    data.leileiFL.mark(data.whiteList[0], data.leileiData.targetMakers.bind1);
                    data.leileiFL.mark(data.whiteList[1], data.leileiData.targetMakers.bind2);

                    data.leileiFL.mark(nullList[0], data.leileiData.targetMakers.stop1);
                    data.leileiFL.mark(nullList[1], data.leileiData.targetMakers.stop2);
                }
            },
            outputStrings: {
                标点: "true",
            }
        }
    ],
})

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
            nullList: [],
        }
    },
    triggers: [
        {
            id: "leilei P6十字火标点",
            netRegex: NetRegexes.gainsEffect({ effectId: "AC[67]" }),
            run: (data, matches, output) => {
                if (matches.effectId === "AC6") {
                    data.blackList.push(matches.targetId);
                } else {
                    data.whiteList.push(matches.targetId);
                }

                data.markCount++;
                if (output.标点() === "true" && data.markCount == 6) {
                    data.leileiFL.clearMark();

                    data.nullList = data.party.details.filter((v) => {
                        return !(data.blackList.includes(v.id) || data.whiteList.includes(v.id));
                    });
                    data.leileiFL.mark(data.blackList[0], data.leileiData.targetMakers.attack1);
                    data.leileiFL.mark(data.blackList[1], data.leileiData.targetMakers.attack2);
                    data.leileiFL.mark(data.blackList[2], data.leileiData.targetMakers.attack3);
                    data.leileiFL.mark(data.blackList[3], data.leileiData.targetMakers.attack4);

                    data.leileiFL.mark(data.whiteList[0], data.leileiData.targetMakers.bind1);
                    data.leileiFL.mark(data.whiteList[1], data.leileiData.targetMakers.bind2);

                    data.leileiFL.mark(data.nullList[0].id, data.leileiData.targetMakers.stop1);
                    data.leileiFL.mark(data.nullList[1].id, data.leileiData.targetMakers.stop2);
                }
            },
            outputStrings: {
                标点: "true",
            }
        }
    ],
})

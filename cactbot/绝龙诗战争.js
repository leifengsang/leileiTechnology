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
            P5ThunderList: [],
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

                    data.nullList = data.party.partyIds_.filter((a) => {
                        const findFunction = (b) => {
                            return a == b;
                        }

                        return !(data.whiteList.find(findFunction) || data.blackList.find(findFunction));
                    });

                    const sortFunction = (a, b) => {
                        return data.leileiFL.getRoleById(data, a) === "tank" ? 1 : -1;
                    };
                    data.blackList.sort(sortFunction);
                    data.whiteList.sort(sortFunction);
                    data.nullList.sort(sortFunction);

                    data.leileiFL.mark(data.blackList[0], data.leileiData.targetMarkers.attack1);
                    data.leileiFL.mark(data.blackList[1], data.leileiData.targetMarkers.attack2);
                    data.leileiFL.mark(data.blackList[2], data.leileiData.targetMarkers.attack3);
                    data.leileiFL.mark(data.blackList[3], data.leileiData.targetMarkers.attack4);

                    data.leileiFL.mark(data.whiteList[0], data.leileiData.targetMarkers.bind1);
                    data.leileiFL.mark(data.whiteList[1], data.leileiData.targetMarkers.bind2);

                    data.leileiFL.mark(data.nullList[0], data.leileiData.targetMarkers.stop1);
                    data.leileiFL.mark(data.nullList[1], data.leileiData.targetMarkers.stop2);
                }
            },
            outputStrings: {
                标点: "true",
            }
        },
        {
            id: "leilei P5一运雷点名",
            netRegex: NetRegexes.gainsEffect({ effectId: "B11" }),
            run: (data, matches, output) => {
                data.P5ThunderList.push(matches.targetId);
                if (data.P5ThunderList.length == 2) {
                    data.leileiFL.clearMark();

                    data.leileiFL.mark(data.P5ThunderList[0], data.leileiData.targetMarkers.stop1);
                    data.leileiFL.mark(data.P5ThunderList[1], data.leileiData.targetMarkers.stop2);
                }
            },
            outputStrings: {
                标点: "true",
            }
        }
    ],
})

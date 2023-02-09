/**
 * 绝神兵 三连桶
 */

Options.Triggers.push({
    zoneId: ZoneId.TheWeaponsRefrainUltimate,
    initData: () => {
        return {
            markList: [], //石牢点名列表
        }
    },
    triggers: [
        {
            id: "leilei 大怒震",
            netRegex: NetRegexes.startsUsing({ id: "2B67" }),
            run: (data) => {
                data.leileiFL.clearMark();
            }
        },
        {
            id: "leilei 三连桶石牢点名",
            netRegex: NetRegexes.ability({ id: "2B6[BC]" }),
            condition: (data, matches) => {
                //大怒震后的前三个石牢点名为三连桶点名
                return data.markList.length < 3;
            },
            run: (data, matches) => {
                data.markList.push({
                    id: matches.targetId,
                    name: matches.target,
                    job: data.party.details.find((v) => {
                        return v.id == matches.targetId;
                    })?.job,
                });

                //点名到达三个，开始标记
                if (data.markList.length == 3) {
                    data.markList.sort((a, b) => {
                        return data.leileiFL.getJobPriority(a.job) - data.leileiFL.getJobPriority(b.job);
                    });

                    data.leileiFL.mark(data.markList[0].id, data.leileiData.targetMarkers.attack1);
                    data.leileiFL.mark(data.markList[1].id, data.leileiData.targetMarkers.attack2);
                    data.leileiFL.mark(data.markList[2].id, data.leileiData.targetMarkers.attack3);
                }
            },
        },
    ]
})
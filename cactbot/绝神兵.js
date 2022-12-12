/**
 * 绝神兵 三连桶
 */

Options.Triggers.push({
    zoneId: ZoneId.TheWeaponsRefrainUltimate,
    triggers: [
        {
            id: "leilei 大怒震",
            netRegex: NetRegexes.startsUsing({ id: "2B67" }),
            run: (data) => {
                data.markList = []; //初始化石牢点名列表
                data.leileiData.leileiFL.clearMark();
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
                    const compareFunction = (obj) => {
                        return data.leileiData.myParty.findIndex((v) => {
                            return v.id == obj.id;
                        });
                    }
                    data.markList.sort((a, b) => {
                        return compareFunction(a) - compareFunction(b);
                    });

                    data.leileiData.leileiFL.mark(data.markList[0].id, data.leileiData.targetMakers.attack1);
                    data.leileiData.leileiFL.mark(data.markList[1].id, data.leileiData.targetMakers.attack2);
                    data.leileiData.leileiFL.mark(data.markList[2].id, data.leileiData.targetMakers.attack3);
                }
            }
        },
    ]
})
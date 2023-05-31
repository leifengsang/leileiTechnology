/**
 * p10s
 */

Options.Triggers.push({
    // zoneId: ZoneId.AnabaseiosTheTenthCircleSavage,
    // zoneId: ZoneId.MatchAll,
    zoneRegex: /Anabaseios The Tenth Circle \(Savage\)/,
    initData: () => {
        return {
            bondDic: {}, //key:playerId, value:{sec, count}
            bondDone: false,
            bondContent: "",
            bondDelay: 0,
            doneCount: 0,
        }
    },
    triggers: [
        {
            id: "leilei p10s 钢铁月环",
            //82A6 钢铁
            //82A7 月环
            netRegex: NetRegexes.startsUsing({ id: ["82A6", "82A7"] }),
            infoText: (data, matches, output) => {
                if (matches.id === "82A6") {
                    return output.钢铁();
                } else {
                    return output.月环();
                }
            },
            outputStrings: {
                钢铁: "钢铁",
                月环: "月环"
            }
        },
        {
            id: "leilei p10s 上buff",
            netRegex: NetRegexes.startsUsing({ id: "82A1" }),
            run: (data) => {
                data.bondCount++;
                //初始化数据
                data.party.partyIds_.forEach(e => {
                    data.bondDic[e] = [];
                });
                data.bondDone = false;
                data.bondContent = "";
                data.bondDelay = 0;

            },
        },
        {
            id: "leilei p10s 单/双/四人buff",
            //DDE 单人
            //DDF 双人
            //E70 四人
            netRegex: NetRegexes.gainsEffect({ effectId: ["DDE", "DDF", "E70"] }),
            condition: (data) => {
                return !data.bondDone;
            },
            preRun: (data, matches, output) => {
                const sec = matches.duration;
                let count;
                switch (matches.effectId) {
                    case "DDE":
                        count = 1;
                        break;
                    case "DDF":
                        count = 2;
                        break;
                    case "E70":
                        count = 4;
                        break;
                    default:
                        break;
                }

                let list = data.bondDic[matches.targetId];
                list.push({ sec: sec, count: count });
                if (list.length == 2) {
                    data.bondDone = true;

                    //处理数据
                    list.sort((a, b) => {
                        return a.sec < b.sec ? -1 : 1;
                    });
                    data.bondDelay = list[0].sec;
                    const getContent = (count) => {
                        switch (count) {
                            case 1:
                                return output.count1();
                            case 2:
                                return output.count2();
                            case 4:
                                return output.count4();
                            default:
                                return "";
                        }
                    }
                    const content1 = getContent(list[0].count);
                    const content2 = getContent(list[1].count);
                    data.bondContent = output.content({ count1: content1, count2: content2 });
                }
            },
            delaySeconds: (data) => {
                let advanceTime;
                switch (data.bondCount) {
                    case 1:
                    case 4:
                        //第一次需要提前10秒报，前往左右平台
                        //第四次 磕头 需要提前10秒报，左右站位击退
                        advanceTime = 10;
                        break;
                    default:
                        //默认提前5秒报
                        advanceTime = 5;
                        break;
                }
                return data.bondDelay - advanceTime;
            },
            infoText: (data) => {
                return data.bondContent;
            },
            outputStrings: {
                content: "先${count1}人,再${count2}人",
                count1: "单",
                count2: "双",
                count4: "四",
            }
        },
    ]
})
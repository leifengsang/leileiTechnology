/**
 * p10s
 */

const headMarker = {
}

const firstDecimalMarker = parseInt("02B7", 16);
const getHeadmarkerId = (data, matches) => {
    if (!data.leileiDecOffset) data.leileiDecOffset = parseInt(matches.id, 16) - firstDecimalMarker;
    return (parseInt(matches.id, 16) - data.leileiDecOffset).toString(16).toUpperCase().padStart(4, "0");
};

Options.Triggers.push({
    zoneId: ZoneId.AnabaseiosTheTenthCircleSavage,
    initData: () => {
        return {
            meltdownSpreadList: []
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
            id: "leilei p10s Headmarker Tracker",
            netRegex: NetRegexes.headMarker({}),
            condition: (data) => undefined === data.leileiDecOffset,
            run: (data, matches) => {
                getHeadmarkerId(data, matches);
            },
        },
        {
            id: "leilei p10s 直线分摊",
            netRegex: NetRegexes.startsUsing({ id: "829D" }),
            infoText: (data, matches) => {
                //初始化点名列表
                data.meltdownSpreadList = [];
            },
        },
        {
            id: "leilei p10s 直线分摊 分散点名",
            netRegex: NetRegexes.headMarker({}),
            run: (data, matches, output) => {
                if (output.是否标记() !== "true") {
                    return;
                }
                const id = getHeadmarkerId(data, matches);
                //TODO 判断标记id

                data.meltdownSpreadList.push(matches.targetId);

                if (data.meltdownSpreadList.length != 2) {
                    return;
                }
                const rpRuleList = output.优先级().split("/");
                data.meltdownSpreadList.sort((a, b) => {
                    return rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, a)) - rpRuleList.indexOf(data.leileiFL.getRpByHexId(data, b));
                });
                data.leileiFL.clearMark();
                data.leileiFL.mark(data.meltdownSpreadList[0], data.leileiData.targetMarkers.attack1);
                data.leileiFL.mark(data.meltdownSpreadList[1], data.leileiData.targetMarkers.attack2);
            },
            outputStrings: {
                是否标记: "false",
                优先级: "MT/ST/H1/H2/D1/D2/D3/D4",
            }
        },
        {
            id: "leilei p10s 直线分摊 取消分散点名标记",
            netRegex: NetRegexes.startsUsing({ id: "829D" }),
            delaySeconds: 10,
            infoText: (data, matches) => {
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
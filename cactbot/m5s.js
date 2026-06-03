/**
 * m5s
 */

Options.Triggers.push({
    zoneId: ZoneId.AacCruiserweightM1Savage,
    initData: () => ({
        wavelengthCount: {
            alpha: 0,
            beta: 0,
        },
    }),
    triggers: [
        {
            id: 'R5S Flip to AB Side',
            type: 'StartsUsing',
            netRegex: { id: ['A780', 'A781'] },
            infoText: (data, matches, output) => {
                // A780 = Flip to A-side, A781 = Flip to B-side
                data.storedABSideMech = matches.id === 'A780' ? 'roleGroup' : 'lightParty';
                return output.stored({ mech: output[data.storedABSideMech]() });
            },
            outputStrings: {
                stored: '(稍后 ${mech})',
                lightParty: '双奶分摊',
                roleGroup: '职能分散',
            },
        },
        {
            // Wavelength α debuff timers are applied with 40.5, 25.5, 25.5, 30.5 or
            //  38.0, 23.0, 23.0, 28.0 durations depending on which group gets hit first
            //
            // Wavelength β debuff timers are applied with 45.5, 30.5, 20.5, 25.5 or
            //  43.0, 28.0, 18.0, 23.0 durations depending on which group gets hit first
            id: 'R5S Wavelength Merge Order',
            type: 'GainsEffect',
            suppressSeconds: 0.5,
            netRegex: { effectId: ['116E', '116F'] },
            preRun: (data, matches) => {
                matches.effectId === '116E' ? data.wavelengthCount.alpha++ : data.wavelengthCount.beta++;
            },
            durationSeconds: (_data, matches) => parseFloat(matches.duration),
            infoText: (data, matches, output) => {
                if (matches.target === data.me) {
                    if (matches.effectId === '116E') {
                        const count = data.wavelengthCount.alpha;
                        switch (count) {
                            case 1:
                                return output.merge({ order: output.third() });
                            case 2:
                                return output.merge({ order: output.first() });
                            case 3:
                                return output.merge({ order: output.second() });
                            case 4:
                                return output.merge({ order: output.fourth() });
                            default:
                                break;
                        }
                    } else {
                        const count = data.wavelengthCount.beta;
                        switch (count) {
                            case 1:
                                return output.merge({ order: output.fourth() });
                            case 2:
                                return output.merge({ order: output.second() });
                            case 3:
                                return output.merge({ order: output.first() });
                            case 4:
                                break;
                        }
                    }
                }
            },
            outputStrings: {
                merge: '${order} 撞毒',
                first: '第1组',
                second: '第2组',
                third: '第3组',
                fourth: '第4组',
            },
        },
    ]
})
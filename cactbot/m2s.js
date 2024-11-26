/**
 * m2s
 */

Options.Triggers.push({
    zoneId: ZoneId.AacLightHeavyweightM2Savage,
    triggers: [
        {
            id: 'R2S Partners/Spread Counter',
            type: 'StartsUsing',
            netRegex: { id: ['9184', '9185', '9B08', '9B09'], capture: false },
            run: (data) => data.partnersSpreadCounter++,
        },
        {
            id: 'R2S Drop of Venom',
            type: 'StartsUsing',
            netRegex: { id: '9185', capture: false },
            alarmText: (_data, _matches, output) => output.text(),
            run: (data) => data.storedPartnersSpread = 'partners',
            durationSeconds:50,
            outputStrings: {
                text: {
                    en: 'Stored Partners',
                    de: 'Gespeichert: Partner',
                    ja: 'あとでペア',
                    cn: '存储分摊',
                },
            },
        },
        {
            id: 'R2S Splash of Venom',
            type: 'StartsUsing',
            netRegex: { id: '9184', capture: false },
            alarmText: (_data, _matches, output) => output.text(),
            run: (data) => data.storedPartnersSpread = 'spread',
            durationSeconds:50,
            outputStrings: {
                text: {
                    en: 'Stored Spread',
                    de: 'Gespeichert: Verteilen',
                    ja: 'あとで散開',
                    cn: '存储分散',
                },
            },
        },
        {
            id: 'R2S Drop of Love',
            type: 'StartsUsing',
            netRegex: { id: '9B09', capture: false },
            alarmText: (_data, _matches, output) => output.text(),
            run: (data) => data.storedPartnersSpread = 'partners',
            durationSeconds:30,
            outputStrings: {
                text: {
                    en: 'Stored Partners',
                    de: 'Gespeichert: Partner',
                    ja: 'あとでペア',
                    cn: '存储分摊',
                },
            },
        },
        {
            id: 'R2S Spread Love',
            type: 'StartsUsing',
            netRegex: { id: '9B08', capture: false },
            alarmText: (_data, _matches, output) => output.text(),
            run: (data) => data.storedPartnersSpread = 'spread',
            durationSeconds:50,
            outputStrings: {
                text: {
                    en: 'Stored Spread',
                    de: 'Gespeichert: Verteilen',
                    ja: 'あとで散開',
                    cn: '存储分散',
                },
            },
        },
        {
            id: 'R2S Delayed Partners/Spread Callout',
            type: 'StartsUsing',
            netRegex: { id: ['9184', '9185', '9B08', '9B09'], capture: false },
            delaySeconds: (data) => {
                // TODO: Review these delay timings
                switch (data.partnersSpreadCounter) {
                    case 1:
                        return 14;
                    case 2:
                        return 11;
                    case 3:
                        return 37;
                    case 4:
                        return 62;
                    case 5:
                        return 55;
                }
                return 0;
            },
            durationSeconds: 7,
            infoText: (data, _matches, output) => output[data.storedPartnersSpread ?? 'unknown'](),
            outputStrings: {
                spread: {
                    en: 'Spread',
                    de: 'Verteilen',
                    ja: '散開',
                    cn: '分散',
                },
                partners: {
                    en: 'Partners',
                    de: 'Partner',
                    ja: 'ペア',
                    cn: '分摊',
                },
                unknown: Outputs.unknown,
            },
        },
    ]
})
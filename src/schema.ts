import { garageClosed, garageOpen, sidegateGate, sidegatePost1, sidegatePost2 } from "./const";

export const GarageCardEditorSchema = [
    {
        name: "entity",
        selector: { entity: {domain: ["switch"], device_class: "garage"} }
    },
    {
        name: "sensor",
        selector: { entity: {domain: ["binary_sensor"], device_class: "garage_door"} }
    },
    {
        name: "name",
        selector: { text: {} }
    },
    // {
    //     name: "icon",
    //     selector: {
    //         select: {
    //           options: [
    //             {
    //               value: garageClosed + ":" + garageOpen,
    //               label: "Garagem",
    //             },
    //             {
    //               value: sidegatePost1 + ":" + sidegateGate + ":" + sidegatePost2,
    //               label: "Portão",
    //             },
    //           ],
    //         },
    //       },
    // }
]
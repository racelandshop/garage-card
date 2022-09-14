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
]
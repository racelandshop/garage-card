/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';
import { customElement, property, state } from 'lit/decorators';
import { BoilerplateCardConfig } from './types';
import { GarageCardEditorSchema } from './schema';
import { assert, object, optional, string, assign, any, boolean } from "superstruct";
import { classMap } from 'lit/directives/class-map';
import { localize } from './localize/localize';


export const baseLovelaceCardConfig = object({
  type: string(),
  view_layout: any(),
});

const cardConfigStruct = assign(
  baseLovelaceCardConfig,
  object({
    name: optional(string()),
    entity: optional(string()),
    sensor: optional(string()),
    show_name: optional(boolean()),
    show_state: optional(boolean()),
    show_preview: optional(boolean()),
    icon: optional(string()),
  })
);

const garageMap = "M46.71 48.2602H40.51V20.3502H9.50005V48.2602H3.30005V14.1502L25 1.74023L46.71 14.1402V48.2602Z M12.6001 23.4502H37.4001V29.6502H12.6001V23.4502Z:M12.6001 32.75H37.4001V38.95H12.6001V32.75Z M37.4101 42.0498H12.6001V48.2498H37.4101V42.0498Z";
const gateMap = "M8.57,15.46H4.9c-0.13,0-0.37,0.08-0.37,0.18l0.28,1.27v18.63c0,0.25,0.2,0.45,0.45,0.45h2.95c0.25,0,0.45-0.2,0.45-0.45V16.91l0.28-1.27C8.94,15.54,8.69,15.46,8.57,15.46z:M39.69,18.39H10.31c-0.47,0-0.85,0.38-0.85,0.85v14.89c0,0.47,0.38,0.85,0.85,0.85h29.38c0.47,0,0.85-0.38,0.85-0.85V19.24C40.54,18.77,40.16,18.39,39.69,18.39z M39.78,33.77H10.22v-3.91h29.56V33.77z M39.78,28.65H10.22v-3.91h29.56V28.65z M39.78,23.53H10.22v-3.91h29.56V23.53z:M45.1,15.46h-3.67c-0.13,0-0.37,0.08-0.37,0.18l0.28,1.27v18.63c0,0.25,0.2,0.45,0.45,0.45h2.95c0.25,0,0.45-0.2,0.45-0.45V16.91l0.28-1.27C45.47,15.54,45.23,15.46,45.1,15.46z"

const iconListMap = [ garageMap, gateMap]
@customElement('garage-card-editor')
export class BoilerplateCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: BoilerplateCardConfig;
  @state() private _toggle?: boolean;
  @state() private _helpers?: any;
  @property({ attribute: false }) icon?: string
  private _initialized = false;

  public setConfig(config: BoilerplateCardConfig): void {
    assert(config, cardConfigStruct);
    this._config = config;
    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }
    this.icon = this._config?.icon
    console.log("config", this._config)
    return true;
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _entity(): string {
    return this._config?.entity || '';
  }

  get _sensor(): string {
    return this._config?.sensor || '';
  }

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }
    this._helpers.importMoreInfoControl('climate');

    return html`
      <ha-form
        .hass=${this.hass}
        .schema=${GarageCardEditorSchema}
        .computeLabel=${this._computeLabel}
        .data = ${this._config}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <div id="picker"> ${localize('editor.config.picker')} </div>
        <div id="icons">
          ${iconListMap.map((icon, index) => {
            if (index) {
            return  html `
            <ha-card class="icon-card ${classMap({
                "on": this.icon === icon,
                "off": this.icon !== icon})}"
                @click=${this._changed_icon.bind(this, icon)}>
            <div id="container">
              <svg viewBox="0 0 50 50" height="100%" width="100%">
                <path class="svg-icon ${classMap({
                "on": this.icon === icon,
                "off": this.icon !== icon})}" d=${icon.split(":")[0]}/>
                <path class="svg-icon ${classMap({
                "on": this.icon === icon,
                "off": this.icon !== icon})}" d=${icon.split(":")[1]}/>
                <path class="svg-icon ${classMap({
                "on": this.icon === icon,
                "off": this.icon !== icon})}" d=${icon.split(":")[2]}/>
              </svg>
            </div>
            </ha-card>`
            }
            return html `
            <ha-card class="icon-card ${classMap({
                "on": this.icon === icon,
                "off": this.icon !== icon})}"
                @click=${this._changed_icon.bind(this, icon)}>
            <div id="containerMin">
              <svg viewBox="0 0 50 50" height="100%" width="100%">
                <path class="svg-icon ${classMap({
                "on": this.icon === icon,
                "off": this.icon !== icon})}" d=${icon.split(":")[0]}/>
                <path class="svg-icon ${classMap({
                "on": this.icon === icon,
                "off": this.icon !== icon})}" d=${icon.split(":")[1]}/>
                <path class="svg-icon ${classMap({
                "on": this.icon === icon,
                "off": this.icon !== icon})}" d=${icon.split(":")[2]}/>
              </svg>
            </div>
            </ha-card>`
          }

            )
          }
        </div>
    `;
  }

  private _changed_icon(icon: string): void {
    if (!this._config || !this.hass) {
      return;
    }
    this._config = { ...this._config, icon: icon }
    this.icon = icon
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }


  private _computeLabel(schema) {
    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const config = ev.detail.value;
    fireEvent(this, "config-changed", { config });
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-card{
        width: 20%;
        height: 70px;
        background-color: var(--ha-card-background);
        border: 2px solid var(--divider-color);
        cursor: pointer;
        display: flex;
        justify-content: center;
        margin: 10px;
      }

      #container {
        height: 100%;
        width: 75%;
      }
      #containerMin {
        width: 30%;
        height: 100%;
      }
      @media only screen and (max-width: 600px) {
        ha-card{
          width: 30%;
          height: 70px;
          background-color: var(--ha-card-background);
          border: 2px solid var(--divider-color);
          cursor: pointer;
          display: flex;
          justify-content: center;
        }
        #containerMin {
          width: 50%;
          height: 100%;
        }
      }
      ha-card.icon-card.on{
        color: var(--accent-color);
        box-shadow: 0px 0px 5px var(--accent-color) , 0px 0px 5px var(--accent-color);
      }
      .svg-icon.off {
        fill: var(--paper-item-icon-color);
      }
      .svg-icon.on {
        fill: var(--accent-color);
      }
      #picker {
        margin-top: 50px;
        font-size: 1.0rem;
        font-weight: 450;
      }
      #icons {
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .option {
        padding: 3% 0%;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
        display: grid;
      }

      ha-formfield {
        padding: 0px 10px 0px 20px;
        max-width: 211px;
      }
    `;
  }
}

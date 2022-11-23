/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  TemplateResult,
  css,
  PropertyValues,
  CSSResultGroup,
} from 'lit';
import { classMap } from "lit/directives/class-map";
import { customElement, property, state } from "lit/decorators";
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  getLovelace,
  fireEvent,
  handleAction,
} from 'custom-card-helpers';

import './editor';

import type { BoilerplateCardConfig } from './types';
import { localize } from './localize/localize';
import { ConfirmDialogParams } from './show-confirm-dialog';
import { HassEntity } from 'home-assistant-js-websocket/dist/types';
import { UNAVAILABLE, UNAVAILABLE_STATES } from './const';
import { ifDefined } from 'lit/directives/if-defined';

  export const haStyleDialog = css`
    /* mwc-dialog (ha-dialog) styles */
    ha-dialog {
      --mdc-dialog-min-width: 400px;
      --mdc-dialog-max-width: 600px;
      --mdc-dialog-heading-ink-color: var(--primary-text-color);
      --mdc-dialog-content-ink-color: var(--primary-text-color);
      --justify-action-buttons: space-between;
      --mdc-switch__pointer_events: auto;
    }
    ha-dialog .form {
      padding-bottom: 24px;
      color: var(--primary-text-color);
    }
    a {
      color: var(--accent-color) !important;
    }
    /* make dialog fullscreen on small screens */
    @media all and (max-width: 450px), all and (max-height: 500px) {
      ha-dialog {
        --mdc-dialog-min-width: calc(
          100vw - env(safe-area-inset-right) - env(safe-area-inset-left)
        );
        --mdc-dialog-max-width: calc(
          100vw - env(safe-area-inset-right) - env(safe-area-inset-left)
        );
        --mdc-dialog-min-height: 100%;
        --mdc-dialog-max-height: 100%;
        --vertial-align-dialog: flex-end;
        --ha-dialog-border-radius: 0px;
      }
    }
    mwc-button.warning {
      --mdc-theme-primary: var(--error-color);
    }
    .error {
      color: var(--error-color);
    }
  `;

@customElement('confirm-dialog')
export class HuiConfirmGarage extends LitElement  {


  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) learningOn = false;

  @property({ attribute: false }) quickLearning = false;

  @property({ attribute: false }) learningLock = false;

  @property({ attribute: false }) buttonBeingLearned = "none";

  @state() private config!: BoilerplateCardConfig;

  @state() private _params?: ConfirmDialogParams;

  @state() private garageInfo!: BoilerplateCardConfig;


  public async showDialog(params: ConfirmDialogParams): Promise<void> {
    this._params = params;
    this.garageInfo = this._params.garageInfo;
    this.config = this.garageInfo;
  }

  public closeDialog() {
    this._params = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
  }

  protected async firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    fireEvent(this, 'config-changed', { config: this.config });
  }


  public setConfig(config: BoilerplateCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }
    return hasConfigOrEntityChanged(this, changedProps, true);
  }

  protected render(): TemplateResult | void {
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));

    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    if (!this._params) {
      return html``;
    }
    const stateEntity: any = this.config.entity ? this.hass.states[this.config.entity] : undefined;

    const stateSensor = this.hass.states[this.config.sensor];

    const name = this.config.show_name ? this.config.name || (stateEntity ? this.computeStateName(stateEntity) : "") : "";

    return html`
      <ha-dialog
          open
          scrimClickAction
          hideActions
          @closed=${this.closeDialog}
          .heading=${this.hass!.localize(
            "ui.panel.lovelace.editor.edit_lovelace.header"
          )}
        >
          <div slot="heading" class="heading">
            <ha-header-bar>
              <div
                slot="title"
                class="main-title"
                .title=${name}
              >
              </div>
              <ha-icon-button
              slot="navigationIcon"
              dialogAction="cancel"
              .label=${this.hass!.localize(
                "ui.dialogs.more_info_control.dismiss")}
              id="cancel"
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
            ></ha-icon-button>
            </ha-header-bar>
          </div>
          <div class="contentFather">
            <ha-card
            @click=${this._handleAction}
            class=${classMap({
                "state-on":
                    ifDefined(stateSensor ? this.computeActiveState(stateSensor) : "on") === "on",
                "state-off":
                    ifDefined(stateSensor ? this.computeActiveState(stateSensor) : "off") === "off",
                "no-sensor": stateSensor === undefined,
                "state-unavailable": stateEntity?.state === UNAVAILABLE || stateSensor?.state === UNAVAILABLE,
            })}>
                <div class="row">
                    <svg viewBox="-10 -8 70 70" height="100%" width="100%" class="svg-icon">
                        <path id="svg" class=${classMap({
                                "state-on":
                                ifDefined(stateSensor ? this.computeActiveState(stateSensor) : "on") === "on",
                                "state-off":
                                ifDefined(stateSensor ? this.computeActiveState(stateSensor) : "off") === "off",
                                "no-sensor-body": stateSensor === undefined,
                                "state-unavailable": stateEntity?.state === UNAVAILABLE || stateSensor?.state === UNAVAILABLE,
                            })}  d="M 25 3 C 18.3633 3 13 8.3633 13 15 L 13 20 L 37 20 L 37 15 C 37 8.3633 31.6367 3 25 3 Z M 25 5 C 30.5664 5 35 9.4336 35 15 L 35 20 L 15 20 L 15 15 C 15 9.4336 19.4336 5 25 5 Z M 25 3"/>
                        <path id="svg" class=${classMap({
                                "state-on-body":
                                ifDefined(stateSensor ? this.computeActiveState(stateSensor) : "on") === "on",
                                "state-off-body":
                                ifDefined(stateSensor ? this.computeActiveState(stateSensor) : "off") === "off",
                                "no-sensor-body": stateSensor === undefined,
                                "state-unavailable": stateEntity?.state === UNAVAILABLE || stateSensor?.state === UNAVAILABLE,
                            })} d="M 35 20 L 37 20 L 9 20 C 7.3008 20 6 21.3008 6 23 L 6 47 C 6 48.6992 7.3008 50 9 50 L 41 50 C 42.6992 50 44 48.6992 44 47 L 44 23 C 44 21.3008 42.6992 20 41 20 L 35 20 M 35 20 V 20 H 37 M 37 20 M 35 20 L 35 15 L 37 15 L 37 20 Z Z Z Z M 25 30 C 26.6992 30 28 31.3008 28 33 C 28 33.8984 27.6016 34.6875 27 35.1875 L 27 38 C 27 39.1016 26.1016 40 25 40 C 23.8984 40 23 39.1016 23 38 L 23 35.1875 C 22.3984 34.6875 22 33.8984 22 33 C 22 31.3008 23.3008 30 25 30 Z"/>
                    </svg>
                </div>
            </ha-card>
            <div id="name">${name}</div>
            ${UNAVAILABLE_STATES.includes(stateEntity?.state) && UNAVAILABLE_STATES.includes(stateSensor?.state)
              ? html`` : html `<div id="tap" >${localize("common.tap")}</div>`}
          </div>
          <div slot="secondaryAction" class="options">
            <mwc-button class="button-cancel" @click=${this._cancel}>
            cancelar</mwc-button>
          </div>
          ${UNAVAILABLE_STATES.includes(stateEntity?.state) || UNAVAILABLE_STATES.includes(stateSensor?.state)
              ? html`
                  <unavailable-icon></unavailable-icon>` : html ``}
        </ha-dialog>
    `;
  }

  private computeActiveState = (stateSensor: HassEntity): string => {
      const domain = stateSensor.entity_id.split(".")[0];
      let state = stateSensor.state;
      if (domain === "climate") {
        state = stateSensor.attributes.hvac_action;
      }
      return state;
  };

  private computeObjectId = (entityId: string): string =>
      entityId.substr(entityId.indexOf(".") + 1);

  private computeStateName = (stateSensor: HassEntity): string =>
  stateSensor.attributes.friendly_name === undefined
    ? this.computeObjectId(stateSensor.entity_id).replace(/_/g, " ")
    : stateSensor.attributes.friendly_name || "";

  private _cancel(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    this.closeDialog();
  }

  private _handleAction(ev: PointerEvent): void {
    if (this.hass && this.config && ev.type) {
      handleAction(this, this.hass, this.config, "tap");
    }
  }

  private _showWarning(error_message: string): TemplateResult {
    return html`
      <hui-warning>${error_message}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyleDialog,
      css`
      ha-header-bar {
        --mdc-theme-on-primary: var(--primary-text-color);
        --mdc-theme-primary: var(--mdc-theme-surface);
        flex-shrink: 0;
        }
        .contentFather {
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
            padding: 30px 0px;
        }
        ha-card {
            border-radius: 2.8rem;
            width: 60%;
            height: 60%;
            cursor: pointer;
            display: flex;
            justify-content: center;
        }
        #name {
            text-align: center;
            font-size: 1.8rem;
            font-weight: 450;
            margin-top: 8%;
            margin-bottom: 3%;
        }
        unavailable-icon {
            position: absolute;
            top: 64%;
        }
        @media all and (max-width: 600px) {
            .contentFather {
                margin-top: 35%;
                display: flex;
                justify-content: center;
            }
            unavailable-icon {
                position: absolute;
                top: 35%;
            }
        }
        .main-title {
            user-select: none;
            -webkit-user-select : none;
            -moz-user-select    : none;
            -khtml-user-select  : none;
            -ms-user-select     : none;
        }
        ha-card.state-on {
            background-color: var(--accent-color);
        }
        ha-card.state-off {
            background-color: var(--header-card-picker-background);
        }
        ha-card.no-sensor {
            background-color: var(--accent-color);
        }
        .state-on {
            fill: var(--card-background-color, #44739e);
            transform: matrix(1, 0, 0, 1, 0, -4.7);
            transition: 0.5s ease-out;
        }
        .state-off {
            fill: var(--paper-item-icon-color, #44739e);
            transform: matrix(1, 0, 0, 1, 0, 0);
            transition: 0.5s ease-out;
        }
        .no-sensor .no-sensor-body {
            fill: var(--card-background-color, #44739e);
        }
        .state-on-body {
            fill: var(--card-background-color, #44739e);
            transition: 0.5s ease-out;
        }
        .state-off-body {
            fill: var(--paper-item-icon-color, #44739e);
            transition: 0.5s ease-out;
        }
        .svg-icon{
            transform: scale(0.7);
        }
        .state-unavailable {
            fill: var(--state-unavailable-color);
        }
    `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "confirm-dialog": HuiConfirmGarage;
  }
}
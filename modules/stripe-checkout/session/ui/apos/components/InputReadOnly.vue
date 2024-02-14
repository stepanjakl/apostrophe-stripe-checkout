<template>
    <AposInputWrapper :modifiers="modifiers"
                      :field="field"
                      :error="effectiveError"
                      :uid="uid"
                      :display-options="displayOptions">
        <template #body>
            <div class="apos-input-wrapper">
                <input class="apos-input apos-input--text tooltip-target"
                       readonly
                       disabled
                       v-model="next"
                       :placeholder="$t(field.placeholder)"
                       :id="uid"
                       :autocomplete="field.autocomplete">
                <div v-if="field.copyToClipboard || field.openInNewTab"
                     class="apos-input__button-wrapper">
                    <AposButton v-if="field.copyToClipboard"
                                class="apos-input__button"
                                type="input"
                                :icon-only="true"
                                :disableFocus="false"
                                @click="copyToClipboard()"
                                v-apos-tooltip="{
                                    content: copied ? 'readOnlyField:contentCopied' : 'readOnlyField:copyToClipboard',
                                    placement: 'bottom',
                                    offset: '3',
                                    trigger: 'hover',
                                    hideOnTargetClick: false
                                }">
                        <template v-slot:label>
                            <span class="apos-button__label apos-sr-only"> {{ $t('readOnlyField:copyToClipboard') }} </span>
                            <ContentCopyIcon class="apos-check"
                                             :size="12" />
                        </template>
                    </AposButton>
                    <AposButton v-if="field.openInNewTab"
                                class="apos-input__button"
                                type="input"
                                :icon-only="true"
                                :disableFocus="false"
                                @click="openInNewTab()"
                                v-apos-tooltip="{
                                    content: 'readOnlyField:openInNewTab',
                                    placement: 'bottom',
                                    offset: '3',
                                    trigger: 'hover',
                                    hideOnTargetClick: false
                                }">
                        <template v-slot:label>
                            <span class="apos-button__label apos-sr-only"> {{ $t('readOnlyField:openInNewTab') }} </span>
                            <OpenInNewIcon :size="12" />
                        </template>
                    </AposButton>
                </div>
            </div>
        </template>
    </AposInputWrapper>
</template>

<script>
import AposInputMixin from 'Modules/@apostrophecms/schema/mixins/AposInputMixin'

import ContentCopyIcon from 'vue-material-design-icons/ContentCopy.vue'
import OpenInNewIcon from 'vue-material-design-icons/OpenInNew.vue'

export default {
    name: 'InputReadOnly',
    mixins: [AposInputMixin],
    components: {
        ContentCopyIcon,
        OpenInNewIcon
    },
    props: {
        conditionMet: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    data() {
        return {
            copied: null
        }
    },
    mounted() {
        this.$el.querySelector('.apos-input__button')?.addEventListener('blur', this.focusOut)
        this.$el.querySelector('.apos-input__button')?.addEventListener('focusout', this.focusOut)
    },
    methods: {
        validateAndEmit () {
            // overwrite as there's no need for the inherited validation method
        },
        copyToClipboard() {
            navigator.clipboard.writeText(this.next)
            this.copied = true
        },
        focusOut() {
            this.copied = false
        },
        openInNewTab() {
            window.open(this.field.openInNewTabPrepend + this.next, '_newtab')
        }
    }
}
</script>

<style lang="scss" scoped>
.apos-input[readonly] {
    color: var(--a-base-2);
    border-color: var(--a-base-8);
    background: var(--a-base-9);
    cursor: text;

    &:focus,
    &:active {
        color: var(--a-base-1);
        box-shadow: 0 0 3px var(--a-base-6);
        border-color: var(--a-base-6);
    }
}

.apos-input-wrapper {
    z-index: $z-index-widget-focused-controls;
    position: relative;

    .apos-input__button-wrapper {
        display: flex;
        flex-direction: row;
        column-gap: 6px;
        position: absolute;
        top: 50%;
        right: 6px;
        transform: translateY(-50%);
    }
}

.apos-field--small {
    .apos-input-wrapper {
        display: flex;
        column-gap: 6px;

        .apos-input__button-wrapper {
            position: relative;
            transform: none;
            top: 0;
            right: 0;
        }
    }
}
</style>

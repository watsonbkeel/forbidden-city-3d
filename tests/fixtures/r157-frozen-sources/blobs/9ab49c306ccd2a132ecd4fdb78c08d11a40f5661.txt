/** Shared admission checks; native form/assistive controls keep their keys. */
export function isTextEntryTarget(target) {
  return !!(target?.isContentEditable || target?.closest?.(
    'input, textarea, select, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], [role="textbox"], [role="combobox"], [role="slider"], [role="spinbutton"]'
  ));
}

export function hasShortcutModifier(event) {
  return event.ctrlKey || event.metaKey || event.altKey;
}

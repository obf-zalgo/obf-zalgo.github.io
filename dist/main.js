import { CheckCustomCharacters, Obfuscate, ObfuscateError } from "./lib.js";
document.title = "Zalgo OBF";
const DOM = {
    mainPage: document.getElementById("main_page"),
    codeInputTextArea: document.getElementById("text_area"),
    obfuscateResultTextArea: document.getElementById("result_text"),
    zalgoLevelSliderContainer: document.getElementById("zalgo_level_slider_container"),
    zalgoLevelText: document.getElementById("zalgo_level_text"),
    zalgoLevelSlider: document.getElementById("zalgo_level_slider"),
    variableNameLengthSlider: document.getElementById("variable_name_length_slider"),
    variableNameLengthText: document.getElementById("variable_name_length_text"),
    charsetSelector: document.getElementById("charset_selector"),
    zalgoCharsetOption: document.getElementById("type_zalgo"),
    invisibleCharsetOption: document.getElementById("type_invisible"),
    optionsOverlay: document.getElementById("options_overlay"),
    deobfuscationProtectionOptions: document.getElementById("deobfuscation_protection_options"),
    customizeCharactersButton: document.getElementById("custom_charset_customizer_button"),
    customizeCharactersModal: document.getElementById("customize_char"),
    customizeCharactersTextArea: document.getElementById("customize_text_area"),
    customCodeEditButton: document.getElementById("custom_code_edit_button"),
    customCodeEditPage: document.getElementById("customize_deobfuscation_code_page"),
    customCodeEditTextArea: document.getElementById("deobfuscation_custom_code_text_area")
};
function CopyResult(button) {
  const textarea = document.getElementById('result_text');
  const label    = button.querySelector('.btn-label');
  const text     = textarea.value.trim();

  // 1️⃣ If there's no text, bail out with a "Nothing to copy" flash
  if (!text) {
    label.textContent = '⚠️ Nothing to copy';
    button.disabled   = true;
    setTimeout(() => {
      label.textContent = '📋 Copy Code';
      button.disabled   = false;
    }, 1500);
    return;
  }

  // 2️⃣ Otherwise do the normal copy flow
  navigator.clipboard.writeText(text)
    .then(function() {
      label.textContent = '✅ Copied!';
      button.disabled   = true;
      setTimeout(function() {
        label.textContent = '📋 Copy Code';
        button.disabled   = false;
      }, 1500);
    })
    .catch(function(err) {
      console.error('Copy failed', err);
      label.textContent = '❌ Failed';
      button.disabled   = true;
      setTimeout(function() {
        label.textContent = '📋 Copy Code';
        button.disabled   = false;
      }, 1500);
    });
}


        // Prevent accidental modal closing during drag operations
        function HandleOverlayClick(event, modalType) {
            // Don't close if:
            // 1. Click didn't start and end on the overlay
            // 2. User was dragging
            // 3. Click target is not the overlay itself
            if (event.target === event.currentTarget && 
                !isDragging && 
                mouseDownTarget === event.currentTarget) {
                
                if (modalType === 'customize') {
                    ToggleCustomizeMode(false);
                } else if (modalType === 'options') {
                    ShowOptions(false);
                }
            }
        }
		
		// Track mouse state to prevent accidental modal closing
        let mouseDownTarget = null;
        let isDragging = false;

        // Add event listeners when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Track mousedown globally
            document.addEventListener('mousedown', function(event) {
                mouseDownTarget = event.target;
                isDragging = false;
            });

            // Track mouse movement to detect dragging
            document.addEventListener('mousemove', function(event) {
                if (mouseDownTarget) {
                    isDragging = true;
                }
            });

            // Reset tracking on mouseup
            document.addEventListener('mouseup', function(event) {
                setTimeout(() => {
                    mouseDownTarget = null;
                    isDragging = false;
                }, 10);
            });
        });





function LogarithmicSliderMapValue(sliderMin, sliderMax, base, rawValue) {
    const value = (Math.pow(base, rawValue) - 1) / (base - 1);
    return Math.round(sliderMin + (sliderMax - sliderMin) * value);
}
function LogarithmicSliderUnmapValue(sliderMin, sliderMax, base, targetValue) {
    const t = (targetValue - sliderMin) / (sliderMax - sliderMin);
    const x = t * (base - 1) + 1;
    return Math.log(x) / Math.log(base);
}
const zalgoLevelSliderMinValue = 0;
const zalgoLevelSliderMaxValue = 100;
const zalgoLevelSliderBase = 10;
let zalgoLevel = 3;
function slider_zalgoLevel(e) {
    zalgoLevel = LogarithmicSliderMapValue(zalgoLevelSliderMinValue, zalgoLevelSliderMaxValue, zalgoLevelSliderBase, Number(e.value));
    DOM.zalgoLevelText.textContent = "Zalgo level: " + zalgoLevel.toString();
}
DOM.zalgoLevelSlider.value = LogarithmicSliderUnmapValue(zalgoLevelSliderMinValue, zalgoLevelSliderMaxValue, zalgoLevelSliderBase, zalgoLevel).toString();
const variableNameLengthSliderMinValue = 2;
const variableNameLengthSliderMaxValue = 50;
const variableNameLengthSliderBase = 10;
let variableNameLength = 5;
function slider_variableLength(e) {
    variableNameLength = LogarithmicSliderMapValue(variableNameLengthSliderMinValue, variableNameLengthSliderMaxValue, variableNameLengthSliderBase, Number(e.value));
    DOM.variableNameLengthText.textContent = "Variable name length: " + variableNameLength.toString();
}
DOM.variableNameLengthSlider.value = LogarithmicSliderUnmapValue(variableNameLengthSliderMinValue, variableNameLengthSliderMaxValue, variableNameLengthSliderBase, variableNameLength).toString();
function ShowOptions(show) {
    DOM.optionsOverlay.style.display = show ? "flex" : "none";
    DOM.mainPage.style.filter = show ? "blur(3px)" : "";
}


function ToggleCustomizeMode(on, bypassValidation = false) {
    if (!on) {
        if (!bypassValidation && !ValidateCustomCharacters()) {
            return;
        }
        if (bypassValidation) {
            DOM.customizeCharactersTextArea.value = "";
        }
        DOM.customizeCharactersModal.style.display = "none";
    } else {
        DOM.customizeCharactersModal.style.display = "";
    }
}


let customCharacters = [];
function ValidateCustomCharacters() {
    const characters = [...DOM.customizeCharactersTextArea.value];
    const { startingChars, nonStartingChars, invalidChars } = CheckCustomCharacters(characters);
    const invalidCharsDiv = document.getElementById("invalid_chars");
    if (invalidChars.size !== 0) {
        const codePointsDivText = Array.from(invalidChars).reduce((acc, curr) => {
            const codePoint = curr.codePointAt(0);
            if (codePoint === undefined) {
                return acc;
            }
            if (curr === " ") {
                curr = "space";
            }
            return acc + "<div style='font-family: consolas; font-size: 20px; margin-top: 10px;'>U+"
                + codePoint.toString(16).toUpperCase().padStart(4, "0") + " <span class='invalid_char'>" + curr + "</span></div>";
        }, "");
        invalidCharsDiv.innerHTML = "<div style='margin-top: 10px;'>The following character" + (invalidChars.size === 1 ? "" : "s")
            + " cannot be used in variable names:</div>" + codePointsDivText;
        invalidCharsDiv.style.display = "";
        return false;
    }
    else if (startingChars.length === 0 && nonStartingChars.length !== 0) {
        invalidCharsDiv.innerHTML = "<div style='margin-top: 10px; color: #DC143C; font-weight: bold;'>There are no characters that are valid starting characters in variable names. Enter valid characters.</div>";
        invalidCharsDiv.style.display = "";
        return false;
    }
    else {
        invalidCharsDiv.style.display = "none";
        customCharacters = characters;
        return true;
    }
}
let charset = "zalgo";
function CharsetChanged(name) {
    switch (name) {
        case "zalgo":
        case "invisible":
        case "iiii":
        case "lines":
        case "custom":
            charset = name;
            break;
        default:
            return;
    }
    DOM.zalgoLevelSliderContainer.style.display = (charset === "zalgo") ? "" : "none";
    DOM.customizeCharactersButton.style.display = (charset === "custom") ? "" : "none";
}
let codeGenerationTarget = "es6+";
function CodeGenerationTargetChanged(target) {
    switch (target) {
        case "es5-":
        case "es6+":
        case "nodejs":
            codeGenerationTarget = target;
            break;
        default:
            return;
    }
    const newFeaturesDisabled = codeGenerationTarget === "es5-";
    DOM.zalgoCharsetOption.disabled = newFeaturesDisabled;
    DOM.invisibleCharsetOption.disabled = newFeaturesDisabled;
    if (newFeaturesDisabled) {
        const selectedValue = DOM.charsetSelector.value;
        if (selectedValue === "zalgo" || selectedValue === "invisible") {
            DOM.charsetSelector.value = "iiii";
            CharsetChanged("iiii");
        }
    }
}
let isDeobfuscationProtection = false;
let deobfuscationProtectionMode = "skip";
function DeobfuscationProtectionChanged(on) {
    isDeobfuscationProtection = on;
    DOM.deobfuscationProtectionOptions.style.visibility = on ? "" : "hidden";
    DOM.customCodeEditButton.style.display = (deobfuscationProtectionMode === "custom" && on) ? "" : "none";
}
function ShowCustomCodeEditor(show) {
         document.getElementById('custom_code_add').style.display = show ? "" : "none";  // Show/hide the custom code modal
}

function DeobfuscationProtectionModeChanged(mode) {
    switch (mode) {
        case "skip":
        case "error":
        case "loop":
        case "custom":
            deobfuscationProtectionMode = mode;
            break;
        default:
            return;
    }
    DOM.customCodeEditButton.style.display = (mode === "custom" && isDeobfuscationProtection) ? "" : "none";
}


function AutoResizeTextarea(textarea, padding) {
    textarea.style.height = "auto";
    textarea.style.height = (textarea.scrollHeight - padding * 2) + "px";
}

async function ObfuscateButton() {
    const obfuscateButton = document.querySelector('.primary-button');
    const originalText = obfuscateButton.textContent;
    const inputText = DOM.codeInputTextArea.value.trim();
    
    // Helper function to reset button state
    const resetButton = () => {
        obfuscateButton.textContent = originalText;
        obfuscateButton.disabled = false;
        obfuscateButton.className = 'primary-button'; // Reset to original classes only
    };
    
    // 1️⃣ If there's no text, show validation message
    if (!inputText) {
        obfuscateButton.textContent = '⚠️ Add Code to Obfuscate';
        obfuscateButton.disabled = true;
        obfuscateButton.className = 'primary-button validation-error';
        
        setTimeout(resetButton, 2500);
        return;
    }

    // Show processing state
    obfuscateButton.textContent = '⏳ Processing...';
    obfuscateButton.disabled = true;
    obfuscateButton.className = 'primary-button processing';

    const text = DOM.codeInputTextArea.value;
    const charsetData = (() => {
        switch (charset) {
            case "zalgo": return {
                type: "zalgo",
                zalgoLevel
            };
            case "custom": return {
                type: "custom",
                characters: customCharacters
            };
            default: return {
                type: charset
            };
        }
    })();
    const deobfuscationProtection = (() => {
        if (!isDeobfuscationProtection) {
            return undefined;
        }
        switch (deobfuscationProtectionMode) {
            case "custom": return {
                type: "custom",
                codeToRun: DOM.customCodeEditTextArea.value
            };
            default: return {
                type: deobfuscationProtectionMode
            };
        }
    })();

    let result = "";
    
    try {
        // Force UI update before heavy computation
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                setTimeout(resolve, 100);
            });
        });

        // Obfuscation logic (same as before)
        result = await new Promise((resolve, reject) => {
            const performObfuscation = () => {
                try {
                    const obfuscationResult = Obfuscate(text, {
                        charset: charsetData,
                        variableNameLength,
                        target: codeGenerationTarget,
                        deobfuscationProtection
                    });
                    resolve(obfuscationResult);
                } catch (ex) {
                    reject(ex);
                }
            };

            if ('scheduler' in window && 'postTask' in window.scheduler) {
                window.scheduler.postTask(performObfuscation, { priority: 'user-blocking' });
            } else if (window.requestIdleCallback) {
                window.requestIdleCallback(performObfuscation, { timeout: 1000 });
            } else {
                setTimeout(performObfuscation, 0);
            }
        });
        
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // 2️⃣ Show success state
        obfuscateButton.textContent = '✅ Obfuscated';
        obfuscateButton.className = 'primary-button success';
        
        DOM.obfuscateResultTextArea.value = result;
        ShowDownloadButton(true);
        
        setTimeout(resetButton, 1500);
        
    } catch (ex) {
        // Show error state
        obfuscateButton.textContent = '❌ Error';
        obfuscateButton.className = 'primary-button error';
        
        setTimeout(resetButton, 2500);
        
        if (ex instanceof ObfuscateError) {
            alert(ex.message);
        }
        return;
    }
}

function DownloadResult() {
    const textarea = document.getElementById('result_text');
    const content = textarea.value.trim();
    
    if (!content) {
        alert('No obfuscated code to download');
        return;
    }
    
    // Create blob with the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'obfuscated_js.txt';
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up the blob URL
    URL.revokeObjectURL(downloadLink.href);
}

function ShowDownloadButton(show) {
    const downloadButton = document.getElementById('download_button');
    if (downloadButton) {
        downloadButton.style.display = show ? 'block' : 'none';
    }
}



// Set functions on the window object, so that they are callable from html
const windowAny = window;
windowAny.CopyResult = CopyResult;
windowAny.slider_zalgoLevel = slider_zalgoLevel;
windowAny.slider_variableLength = slider_variableLength;
windowAny.ShowOptions = ShowOptions;
windowAny.ToggleCustomizeMode = ToggleCustomizeMode;
windowAny.CharsetChanged = CharsetChanged;
windowAny.CodeGenerationTargetChanged = CodeGenerationTargetChanged;
windowAny.DeobfuscationProtectionChanged = DeobfuscationProtectionChanged;
windowAny.DeobfuscationProtectionModeChanged = DeobfuscationProtectionModeChanged;
windowAny.ShowCustomCodeEditor = ShowCustomCodeEditor;
windowAny.AutoResizeTextarea = AutoResizeTextarea;
windowAny.ObfuscateButton = ObfuscateButton;
windowAny.HandleOverlayClick = HandleOverlayClick;
windowAny.ShowDownloadButton = ShowDownloadButton;
windowAny.DownloadResult = DownloadResult;

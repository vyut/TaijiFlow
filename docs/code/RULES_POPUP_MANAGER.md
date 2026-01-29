# Rules Popup Manager Documentation

## Overview

**File:** `js/ui/rules_popup_manager.js`  
**Class:** `RulesPopupManager`  
**Since:** v1.3.0

The `RulesPopupManager` manages the "Rules Configuration" modal. It allows users to view and interact with the 9 heuristic rules used for scoring Taijiquan movements.

## Key Features

-   **Glassmorphism UI:** Consistent with the Display Popup (`bg-white/90`, `backdrop-blur-xl`).
-   **4-Column Grid:** Groups rules into logical categories (Fundamentals, Flow, Structure, Future).
-   **Interactive Tooltips:** Hovering over a rule displays a detailed description in the footer.
-   **Dynamic Event Binding:** Integrates with `RuleConfigManager` to handle logic updates.

## Visual Layout

The rules are categorized as follows:

1.  **L1: Fundamentals (Green)**
    *   **Path Accuracy:** Checks if the wrist follows the reference path.
    *   **Elbow Sinking:** Ensures the elbow stays lower than the shoulder.
    *   **Continuity:** Checks for pauses or stops in movement.

2.  **L2: Flow (Blue)**
    *   **Arm Rotation:** Verifies correct supination/pronation.
    *   **Waist Initiation:** Ensures movement starts from the waist.
    *   **Smoothness:** measures velocity consistency.

3.  **L3: Structure (Purple)**
    *   **Vertical Stability:** Checks for head bobbing or leaning.
    *   **Weight Shift:** Checks for proper weight transfer (Bow Stance).
    *   **Coordination:** Checks sync between upper and lower body.

4.  **L4: Future / Advanced (Yellow/Gray)**
    *   *Reserved for future heuristic rules.*

## Footer Controls

-   **Info Bar:** Displays dynamic descriptions of the currently hovered rule.
-   **Reset Button:** Resets all rule thresholds/settings to default values.
-   **Close Button:** Closes the modal.

## Usage

```javascript
// Initialization
const rulesPopupManager = new RulesPopupManager();
rulesPopupManager.init();

// Open the popup
rulesPopupManager.toggle();
```

## Dependencies

-   `RuleConfigManager` (Refactored from `RulesConfigManager`) - Handles the underlying logic and thresholds.
-   `HeuristicsEngine` - Uses the configured values to score movements.

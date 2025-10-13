import React from 'react';

const wheelOfFortuneHtml = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wheel of Names - Enhanced</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: transparent;
            min-height: 100vh;
            direction: ltr;
            text-align: left;
            padding: 0;
            display: flex;
            flex-direction: column;
            transition: direction 0.3s ease;
            color: #333;
        }

        body[dir="rtl"] {
            direction: rtl;
            text-align: right;
        }
        
        /* Main Content */
        .container {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            flex: 1;
        }

        .main-content {
            display: flex;
            gap: 40px;
            flex-wrap: wrap;
            justify-content: center;
            width: 100%;
            margin-bottom: 40px;
        }

        .wheel-section {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            position: relative;
        }

        .wheel-container {
            position: relative;
            width: 500px;
            height: 500px;
            margin: 0 auto;
        }

        #wheelCanvas {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            transition: transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99);
            will-change: transform;
            cursor: pointer;
        }

        #wheelCanvas:hover:not(.spinning) {
            box-shadow: 0 8px 30px rgba(0,0,0,0.4);
            transform: scale(1.02);
        }

        #wheelCanvas.spinning {
            cursor: not-allowed;
        }

        .wheel-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
        }

        .wheel-container:hover .wheel-overlay {
            opacity: 1;
        }

        .spin-hint {
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-5px);
            }
        }

        .pointer {
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 30px solid transparent;
            border-right: 30px solid transparent;
            border-top: 60px solid #ff4757;
            filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));
            z-index: 10;
        }

        .winner-highlight {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 520px;
            height: 520px;
            border-radius: 50%;
            border: 4px solid #FFD700;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
            pointer-events: none;
            opacity: 0;
            animation: pulse 2s infinite;
            z-index: 5;
        }

        @keyframes pulse {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.8;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.05);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.8;
            }
        }

        .winner-label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.5);
            opacity: 0;
            z-index: 15;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .controls-section {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 450px;
        }

        .input-group {
            margin-bottom: 20px;
        }

        .input-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #333;
        }

        .single-input {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }

        #nameInput {
            flex: 1;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }

        #nameInput:focus {
            outline: none;
            border-color: #667eea;
        }

        #addNameBtn {
            padding: 12px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: transform 0.2s;
        }

        #addNameBtn:hover {
            transform: translateY(-2px);
        }

        #addNameBtn:active {
            transform: translateY(0);
        }

        #namesTextarea {
            width: 100%;
            min-height: 120px;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            resize: vertical;
            transition: border-color 0.3s;
        }

        #namesTextarea:focus {
            outline: none;
            border-color: #667eea;
        }

        .paste-hint {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }

        #pasteNamesBtn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            margin-top: 10px;
            transition: transform 0.2s;
        }

        #pasteNamesBtn:hover {
            transform: translateY(-2px);
        }

        .names-list-container {
            position: relative;
            margin: 20px 0;
        }

        .names-stats {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 10px;
            font-size: 14px;
            color: #666;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .names-list {
            max-height: 200px;
            overflow-y: auto;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 10px;
            background: #f8f9fa;
        }

        .names-list-virtual {
            height: 200px;
            overflow-y: auto;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            background: #f8f9fa;
            position: relative;
        }

        .name-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin-bottom: 8px;
            background: white;
            border-radius: 6px;
            transition: transform 0.2s;
        }

        .name-item:hover {
            transform: translateX(-5px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        body[dir="rtl"] .name-item:hover {
            transform: translateX(5px);
        }

        .name-item.winner {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: white;
            font-weight: bold;
            animation: winnerGlow 2s infinite;
        }

        @keyframes winnerGlow {
            0%, 100% {
                box-shadow: 0 2px 5px rgba(255, 215, 0, 0.3);
            }
            50% {
                box-shadow: 0 5px 15px rgba(255, 215, 0, 0.6);
            }
        }

        .name-text {
            font-weight: 500;
            color: #333;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .name-item.winner .name-text {
            color: white;
        }

        .delete-btn {
            background: #ff4757;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
            flex-shrink: 0;
        }

        .delete-btn:hover {
            background: #ff3838;
        }

        .action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 20px;
        }

        .btn {
            padding: 14px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s;
        }

        #spinBtn {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            grid-column: span 2;
        }

        #spinBtn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
        }

        #spinBtn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        #resetBtn {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            color: white;
        }

        #resetBtn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(250, 112, 154, 0.4);
        }

        #clearAllBtn {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
        }

        #clearAllBtn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(238, 90, 36, 0.4);
        }

        #shareBtn {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            color: #333;
            grid-column: span 2;
        }

        #shareBtn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(168, 237, 234, 0.4);
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .modal-content {
            background: white;
            padding: 40px;
            border-radius: 20px;
            width: 90%;
            max-width: 450px;
            text-align: center;
            animation: slideUp 0.3s;
        }

        @keyframes slideUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .modal-header h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.8rem;
        }

        .winner-icon {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: bounce 1s infinite;
        }

        .winner-name {
            font-size: 2rem;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            -webkit-text-fill-color: initial;
            position: relative;
        }

        .winner-name::before {
            content: '👑';
            position: absolute;
            top: -15px;
            right: 50%;
            transform: translateX(50%);
            font-size: 2rem;
        }

        .modal-footer {
            margin-top: 30px;
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        .modal-btn {
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s;
        }

        #closeModalBtn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        #confirmClearBtn {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
        }

        #cancelClearBtn {
            background: #e0e0e0;
            color: #333;
        }

        .performance-indicator {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 100;
        }

        body[dir="rtl"] .performance-indicator {
            left: auto;
            right: 20px;
        }

        .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            background: #FFD700;
            position: absolute;
            animation: confetti-fall 3s linear;
            z-index: 999;
        }

        @keyframes confetti-fall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }

        .click-effect {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: translate(-50%, -50%);
            pointer-events: none;
            animation: clickRipple 0.6s ease-out;
        }

        @keyframes clickRipple {
            to {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }

        @media (max-width: 1024px) {
            .main-content {
                flex-direction: column;
                align-items: center;
            }
            .wheel-section, .controls-section {
                width: 100%;
                max-width: 600px;
            }
        }
        
        @media (max-width: 768px) {
            .wheel-container {
                width: 350px;
                height: 350px;
            }
            
            .winner-highlight {
                width: 370px;
                height: 370px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="main-content">
            <div class="wheel-section">
                <div class="wheel-container">
                    <div class="pointer"></div>
                    <canvas id="wheelCanvas"></canvas>
                    <div class="wheel-overlay">
                        <div class="spin-hint">
                            <span>🎲</span>
                            <span data-translate="clickToSpin">Click to Spin</span>
                        </div>
                    </div>
                    <div class="winner-highlight" id="winnerHighlight"></div>
                    <div class="winner-label" id="winnerLabel">🏆 <span data-translate="winner">Winner!</span></div>
                </div>
            </div>

            <div class="controls-section">
                <div class="input-group">
                    <label data-translate="addSingleName">Add Single Name</label>
                    <div class="single-input">
                        <input type="text" id="nameInput" placeholder="Enter a name" data-translate-placeholder="enterName">
                        <button id="addNameBtn" data-translate="add">Add</button>
                    </div>
                </div>

                <div class="input-group">
                    <label data-translate="addMultipleNames">Add Multiple Names</label>
                    <textarea id="namesTextarea" placeholder="Paste names here (each name on a new line or separated by commas)" data-translate-placeholder="pasteNames"></textarea>
                    <p class="paste-hint" data-translate="pasteHint">💡 You can paste a list of names separated by commas or new lines</p>
                    <button id="pasteNamesBtn" data-translate="addNames">Add Names</button>
                </div>

                <div class="names-list-container">
                    <div class="names-stats">
                        <span data-translate="namesCount">Names Count: <strong id="namesCount">0</strong></span>
                        <button id="toggleViewBtn" style="background: none; border: none; cursor: pointer; color: #667eea;">🔄 <span data-translate="toggleView">Toggle View</span></button>
                    </div>
                    <div class="names-list" id="namesList"></div>
                </div>

                <div class="action-buttons">
                    <button id="spinBtn" class="btn">🎲 <span data-translate="spinWheel">Spin Wheel</span></button>
                    <button id="resetBtn" class="btn">🔄 <span data-translate="reset">Reset</span></button>
                    <button id="clearAllBtn" class="btn">🗑️ <span data-translate="clearAll">Clear All</span></button>
                    <button id="shareBtn" class="btn">📤 <span data-translate="share">Share</span></button>
                </div>
            </div>
        </div>
    </div>
    <div id="resultModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>🎉 <span data-translate="congratulations">Congratulations!</span></h2>
            </div>
            <div class="modal-body">
                <div class="winner-icon">🏆</div>
                <p data-translate="selectedName">The selected name is:</p>
                <div class="winner-name" id="winnerName"></div>
            </div>
            <div class="modal-footer">
                <button id="closeModalBtn" class="modal-btn" data-translate="ok">OK</button>
            </div>
        </div>
    </div>

    <div id="clearConfirmModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>⚠️ <span data-translate="confirmClear">Confirm Clear</span></h2>
            </div>
            <div class="modal-body">
                <div style="font-size: 3rem; margin-bottom: 20px;">🗑️</div>
                <p data-translate="clearAllMessage">Are you sure you want to clear all names?</p>
                <p style="color: #666; font-size: 14px; margin-top: 10px;" data-translate="cannotUndo">This action cannot be undone</p>
            </div>
            <div class="modal-footer">
                <button id="confirmClearBtn" class="modal-btn" data-translate="clearAll">Clear All</button>
                <button id="cancelClearBtn" class="modal-btn" data-translate="cancel">Cancel</button>
            </div>
        </div>
    </div>

    <div class="performance-indicator" id="performanceIndicator">
        FPS: <span id="fpsCounter">60</span> | <span data-translate="names">Names</span>: <span id="perfNamesCount">0</span>
    </div>

    <script>
        // Translation System
        const translations = {
            en: {
                logo: "Wheel of Names",
                menuTitle: "Main Menu",
                menuSubtitle: "Choose from the menu below",
                spinWheel: "Spin Wheel",
                reset: "Reset",
                clearAll: "Clear All",
                share: "Share",
                aboutUs: "About Us",
                privacy: "Privacy Policy",
                contact: "Contact Us",
                clickToSpin: "Click to Spin",
                winner: "Winner!",
                addSingleName: "Add Single Name",
                enterName: "Enter a name",
                add: "Add",
                addMultipleNames: "Add Multiple Names",
                pasteNames: "Paste names here (each name on a new line or separated by commas)",
                pasteHint: "💡 You can paste a list of names separated by commas or new lines",
                addNames: "Add Names",
                namesCount: "Names Count:",
                toggleView: "Toggle View",
                quickLinks: "Quick Links",
                terms: "Terms & Conditions",
                ourServices: "Our Services",
                wheelOfNames: "Wheel of Names",
                randomPicker: "Random Picker",
                groupGames: "Group Games",
                usefulTools: "Useful Tools",
                contactUs: "Contact Us",
                location: "Riyadh, Saudi Arabia",
                mobileApp: "Mobile App",
                downloadApp: "Download our app now for a better experience",
                allRights: "All Rights Reserved",
                designedWith: "Designed with",
                inSaudi: "in Saudi Arabia",
                congratulations: "Congratulations!",
                selectedName: "The selected name is:",
                ok: "OK",
                confirmClear: "Confirm Clear",
                clearAllMessage: "Are you sure you want to clear all names?",
                cannotUndo: "This action cannot be undone",
                cancel: "Cancel",
                names: "Names",
                addNameSuccess: "Name added successfully",
                nameExists: "Name already exists",
                noNames: "Please add names first",
                resetConfirm: "Are you sure you want to reset the wheel?",
                resetComplete: "Wheel reset to default names",
                clearComplete: "All names cleared",
                nameDeleted: "Name deleted",
                noNewNames: "No new names found",
                linkCopied: "Link copied to clipboard"
            },
            ar: {
                logo: "عجلة الأسماء",
                menuTitle: "القائمة الرئيسية",
                menuSubtitle: "اختر من القائمة أدناه",
                spinWheel: "دور العجلة",
                reset: "إعادة تعيين",
                clearAll: "مسح الكل",
                share: "مشاركة",
                aboutUs: "من نحن",
                privacy: "سياسة الخصوصية",
                contact: "اتصل بنا",
                clickToSpin: "اضغط للدوران",
                winner: "الفائز!",
                addSingleName: "إضافة اسم واحد",
                enterName: "أدخل اسمًا",
                add: "إضافة",
                addMultipleNames: "إضافة أسماء متعددة",
                pasteNames: "ألصق الأسماء هنا (كل اسم في سطر أو مفصول بفاصلة)",
                pasteHint: "💡 يمكنك لصق قائمة من الأسماء مفصولة بفواصل أو أسطر جديدة",
                addNames: "إضافة الأسماء",
                namesCount: "عدد الأسماء:",
                toggleView: "تبديل العرض",
                quickLinks: "روابط سريعة",
                terms: "الشروط والأحكام",
                ourServices: "خدماتنا",
                wheelOfNames: "عجلة الأسماء",
                randomPicker: "اختيار عشوائي",
                groupGames: "ألعاب جماعية",
                usefulTools: "أدوات مفيدة",
                contactUs: "تواصل معنا",
                location: "الرياض، السعودية",
                mobileApp: "تطبيق الموبايل",
                downloadApp: "حمل تطبيقنا الآن واستمتع بتجربة أفضل",
                allRights: "جميع الحقوق محفوظة",
                designedWith: "صُمم بـ",
                inSaudi: "في السعودية",
                congratulations: "مبروك!",
                selectedName: "الاسم المختار هو:",
                ok: "موافق",
                confirmClear: "تأكيد المسح",
                clearAllMessage: "هل أنت متأكد من مسح جميع الأسماء؟",
                cannotUndo: "هذا الإجراء لا يمكن التراجع عنه",
                cancel: "إلغاء",
                names: "الأسماء",
                addNameSuccess: "تم إضافة الاسم بنجاح",
                nameExists: "الاسم موجود بالفعل",
                noNames: "يرجى إضافة أسماء أولاً",
                resetConfirm: "هل أنت متأكد من إعادة تعيين العجلة؟",
                resetComplete: "تم إعادة تعيين العجلة إلى الأسماء الافتراضية",
                clearComplete: "تم مسح جميع الأسماء",
                nameDeleted: "تم حذف الاسم",
                noNewNames: "لم يتم العثور على أسماء جديدة",
                linkCopied: "تم نسخ الرابط إلى الحافظة"
            },
            fr: {
                logo: "Roue des Noms",
                menuTitle: "Menu Principal",
                menuSubtitle: "Choisissez dans le menu ci-dessous",
                spinWheel: "Tourner la Roue",
                reset: "Réinitialiser",
                clearAll: "Tout Effacer",
                share: "Partager",
                aboutUs: "À Propos",
                privacy: "Politique de Confidentialité",
                contact: "Nous Contacter",
                clickToSpin: "Cliquez pour Tourner",
                winner: "Gagnant!",
                addSingleName: "Ajouter un Nom",
                enterName: "Entrez un nom",
                add: "Ajouter",
                addMultipleNames: "Ajouter Plusieurs Noms",
                pasteNames: "Collez les noms ici (un nom par ligne ou séparé par des virgules)",
                pasteHint: "💡 Vous pouvez coller une liste de noms séparés par des virgules ou des sauts de ligne",
                addNames: "Ajouter les Noms",
                namesCount: "Nombre de Noms:",
                toggleView: "Basculer l'Affichage",
                quickLinks: "Liens Rapides",
                terms: "Termes et Conditions",
                ourServices: "Nos Services",
                wheelOfNames: "Roue des Noms",
                randomPicker: "Sélecteur Aléatoire",
                groupGames: "Jeux de Groupe",
                usefulTools: "Outils Utiles",
                contactUs: "Contactez-nous",
                location: "Riyad, Arabie Saoudite",
                mobileApp: "Application Mobile",
                downloadApp: "Téléchargez notre application pour une meilleure expérience",
                allRights: "Tous Droits Réservés",
                designedWith: "Conçu avec",
                inSaudi: "en Arabie Saoudite",
                congratulations: "Félicitations!",
                selectedName: "Le nom sélectionné est:",
                ok: "OK",
                confirmClear: "Confirmer l'Effacement",
                clearAllMessage: "Êtes-vous sûr de vouloir effacer tous les noms?",
                cannotUndo: "Cette action ne peut pas être annulée",
                cancel: "Annuler",
                names: "Noms",
                addNameSuccess: "Nom ajouté avec succès",
                nameExists: "Le nom existe déjà",
                noNames: "Veuillez d'abord ajouter des noms",
                resetConfirm: "Êtes-vous sûr de vouloir réinitialiser la roue?",
                resetComplete: "Roue réinitialisée aux noms par défaut",
                clearComplete: "Tous les noms effacés",
                nameDeleted: "Nom supprimé",
                noNewNames: "Aucun nouveau nom trouvé",
                linkCopied: "Lien copié dans le presse-papiers"
            },
            es: {
                logo: "Rueda de Nombres",
                menuTitle: "Menú Principal",
                menuSubtitle: "Elija del menú de abajo",
                spinWheel: "Girar Rueda",
                reset: "Reiniciar",
                clearAll: "Limpiar Todo",
                share: "Compartir",
                aboutUs: "Acerca de",
                privacy: "Política de Privacidad",
                contact: "Contáctanos",
                clickToSpin: "Haz Clic para Girar",
                winner: "¡Ganador!",
                addSingleName: "Agregar un Nombre",
                enterName: "Ingresa un nombre",
                add: "Agregar",
                addMultipleNames: "Agregar Múltiples Nombres",
                pasteNames: "Pega nombres aquí (cada nombre en una línea nueva o separado por comas)",
                pasteHint: "💡 Puedes pegar una lista de nombres separados por comas o saltos de línea",
                addNames: "Agregar Nombres",
                namesCount: "Cantidad de Nombres:",
                toggleView: "Cambiar Vista",
                quickLinks: "Enlaces Rápidos",
                terms: "Términos y Condiciones",
                ourServices: "Nuestros Servicios",
                wheelOfNames: "Rueda de Nombres",
                randomPicker: "Selector Aleatorio",
                groupGames: "Juegos Grupales",
                usefulTools: "Herramientas Útiles",
                contactUs: "Contáctanos",
                location: "Riad, Arabia Saudita",
                mobileApp: "Aplicación Móvil",
                downloadApp: "Descarga nuestra aplicación ahora para una mejor experiencia",
                allRights: "Todos los Derechos Reservados",
                designedWith: "Diseñado con",
                inSaudi: "en Arabia Saudita",
                congratulations: "¡Felicidades!",
                selectedName: "El nombre seleccionado es:",
                ok: "OK",
                confirmClear: "Confirmar Limpieza",
                clearAllMessage: "¿Estás seguro de que quieres limpiar todos los nombres?",
                cannotUndo: "Esta acción no se puede deshacer",
                cancel: "Cancelar",
                names: "Nombres",
                addNameSuccess: "Nombre agregado exitosamente",
                nameExists: "El nombre ya existe",
                noNames: "Por favor agrega nombres primero",
                resetConfirm: "¿Estás seguro de que quieres reiniciar la rueda?",
                resetComplete: "Rueda reiniciada a nombres predeterminados",
                clearComplete: "Todos los nombres limpiados",
                nameDeleted: "Nombre eliminado",
                noNewNames: "No se encontraron nuevos nombres",
                linkCopied: "Enlace copiado al portapapeles"
            },
            de: {
                logo: "Namenrad",
                menuTitle: "Hauptmenü",
                menuSubtitle: "Wählen Sie aus dem Menü unten",
                spinWheel: "Rad Drehen",
                reset: "Zurücksetzen",
                clearAll: "Alles Löschen",
                share: "Teilen",
                aboutUs: "Über Uns",
                privacy: "Datenschutzrichtlinie",
                contact: "Kontaktieren Sie Uns",
                clickToSpin: "Klicken zum Drehen",
                winner: "Gewinner!",
                addSingleName: "Einzelnen Namen Hinzufügen",
                enterName: "Namen eingeben",
                add: "Hinzufügen",
                addMultipleNames: "Mehrere Namen Hinzufügen",
                pasteNames: "Namen hier einfügen (jeder Name in einer neuen Zeile oder durch Kommas getrennt)",
                pasteHint: "💡 Sie können eine Liste von Namen einfügen, getrennt durch Kommas oder Zeilenumbrüche",
                addNames: "Namen Hinzufügen",
                namesCount: "Anzahl der Namen:",
                toggleView: "Ansicht Umschalten",
                quickLinks: "Schnelllinks",
                terms: "Geschäftsbedingungen",
                ourServices: "Unsere Dienstleistungen",
                wheelOfNames: "Namenrad",
                randomPicker: "Zufälliger Auswähler",
                groupGames: "Gruppenspiele",
                usefulTools: "Nützliche Werkzeuge",
                contactUs: "Kontaktieren Sie Uns",
                location: "Riad, Saudi-Arabien",
                mobileApp: "Mobile App",
                downloadApp: "Laden Sie jetzt unsere App für eine bessere Erfahrung herunter",
                allRights: "Alle Rechte Vorbehalten",
                designedWith: "Entworfen mit",
                inSaudi: "in Saudi-Arabien",
                congratulations: "Herzlichen Glückwunsch!",
                selectedName: "Der ausgewählte Name ist:",
                ok: "OK",
                confirmClear: "Löschen Bestätigen",
                clearAllMessage: "Sind Sie sicher, dass Sie alle Namen löschen möchten?",
                cannotUndo: "Diese Aktion kann nicht rückgängig gemacht werden",
                cancel: "Abbrechen",
                names: "Namen",
                addNameSuccess: "Name erfolgreich hinzugefügt",
                nameExists: "Name existiert bereits",
                noNames: "Bitte fügen Sie zuerst Namen hinzu",
                resetConfirm: "Sind Sie sicher, dass Sie das Rad zurücksetzen möchten?",
                resetComplete: "Rad auf Standardnamen zurückgesetzt",
                clearComplete: "Alle Namen gelöscht",
                nameDeleted: "Name gelöscht",
                noNewNames: "Keine neuen Namen gefunden",
                linkCopied: "Link in die Zwischenablage kopiert"
            },
            zh: {
                logo: "姓名转盘",
                menuTitle: "主菜单",
                menuSubtitle: "从下面的菜单中选择",
                spinWheel: "转动转盘",
                reset: "重置",
                clearAll: "清除全部",
                share: "分享",
                aboutUs: "关于我们",
                privacy: "隐私政策",
                contact: "联系我们",
                clickToSpin: "点击转动",
                winner: "赢家!",
                addSingleName: "添加单个姓名",
                enterName: "输入姓名",
                add: "添加",
                addMultipleNames: "添加多个姓名",
                pasteNames: "在此粘贴姓名（每个姓名占一行或用逗号分隔）",
                pasteHint: "💡 您可以粘贴用逗号或换行符分隔的姓名列表",
                addNames: "添加姓名",
                namesCount: "姓名数量:",
                toggleView: "切换视图",
                quickLinks: "快速链接",
                terms: "条款和条件",
                ourServices: "我们的服务",
                wheelOfNames: "姓名转盘",
                randomPicker: "随机选择器",
                groupGames: "团体游戏",
                usefulTools: "实用工具",
                contactUs: "联系我们",
                location: "利雅得，沙特阿拉伯",
                mobileApp: "移动应用",
                downloadApp: "立即下载我们的应用程序以获得更好的体验",
                allRights: "版权所有",
                designedWith: "设计用",
                inSaudi: "在沙特阿拉伯",
                congratulations: "恭喜!",
                selectedName: "选中的姓名是:",
                ok: "确定",
                confirmClear: "确认清除",
                clearAllMessage: "您确定要清除所有姓名吗?",
                cannotUndo: "此操作无法撤销",
                cancel: "取消",
                names: "姓名",
                addNameSuccess: "姓名添加成功",
                nameExists: "姓名已存在",
                noNames: "请先添加姓名",
                resetConfirm: "您确定要重置转盘吗?",
                resetComplete: "转盘已重置为默认姓名",
                clearComplete: "所有姓名已清除",
                nameDeleted: "姓名已删除",
                noNewNames: "未找到新姓名",
                linkCopied: "链接已复制到剪贴板"
            },
            ja: {
                logo: "名前のホイール",
                menuTitle: "メインメニュー",
                menuSubtitle: "下のメニューから選択してください",
                spinWheel: "ホイールを回す",
                reset: "リセット",
                clearAll: "すべてクリア",
                share: "共有",
                aboutUs: "私たちについて",
                privacy: "プライバシーポリシー",
                contact: "お問い合わせ",
                clickToSpin: "クリックして回転",
                winner: "勝者!",
                addSingleName: "単一の名前を追加",
                enterName: "名前を入力",
                add: "追加",
                addMultipleNames: "複数の名前を追加",
                pasteNames: "ここに名前を貼り付け（各名前を改行またはカンマで区切る）",
                pasteHint: "💡 カンマまたは改行で区切られた名前のリストを貼り付けることができます",
                addNames: "名前を追加",
                namesCount: "名前の数:",
                toggleView: "表示を切り替え",
                quickLinks: "クイックリンク",
                terms: "利用規約",
                ourServices: "私たちのサービス",
                wheelOfNames: "名前のホイール",
                randomPicker: "ランダム選択",
                groupGames: "グループゲーム",
                usefulTools: "便利なツール",
                contactUs: "お問い合わせ",
                location: "リヤド、サウジアラビア",
                mobileApp: "モバイルアプリ",
                downloadApp: "より良い体験のために今すぐアプリをダウンロード",
                allRights: "すべての権利を保有",
                designedWith: "で設計",
                inSaudi: "サウジアラビアで",
                congratulations: "おめでとうございます!",
                selectedName: "選択された名前は:",
                ok: "OK",
                confirmClear: "クリアを確認",
                clearAllMessage: "すべての名前をクリアしてもよろしいですか?",
                cannotUndo: "この操作は元に戻せません",
                cancel: "キャンセル",
                names: "名前",
                addNameSuccess: "名前が正常に追加されました",
                nameExists: "名前は既に存在します",
                noNames: "まず名前を追加してください",
                resetConfirm: "ホイールをリセットしてもよろしいですか?",
                resetComplete: "ホイールがデフォルト名にリセットされました",
                clearComplete: "すべての名前がクリアされました",
                nameDeleted: "名前が削除されました",
                noNewNames: "新しい名前が見つかりませんでした",
                linkCopied: "リンクがクリップボードにコピーされました"
            },
            pt: {
                logo: "Roda de Nomes",
                menuTitle: "Menu Principal",
                menuSubtitle: "Escolha no menu abaixo",
                spinWheel: "Girar Roda",
                reset: "Redefinir",
                clearAll: "Limpar Tudo",
                share: "Compartilhar",
                aboutUs: "Sobre Nós",
                privacy: "Política de Privacidade",
                contact: "Entre em Contato",
                clickToSpin: "Clique para Girar",
                winner: "Vencedor!",
                addSingleName: "Adicionar Nome Único",
                enterName: "Digite um nome",
                add: "Adicionar",
                addMultipleNames: "Adicionar Múltiplos Nomes",
                pasteNames: "Cole nomes aqui (cada nome em uma nova linha ou separado por vírgulas)",
                pasteHint: "💡 Você pode colar uma lista de nomes separados por vírgulas ou quebras de linha",
                addNames: "Adicionar Nomes",
                namesCount: "Contagem de Nomes:",
                toggleView: "Alternar Visualização",
                quickLinks: "Links Rápidos",
                terms: "Termos e Condições",
                ourServices: "Nossos Serviços",
                wheelOfNames: "Roda de Nomes",
                randomPicker: "Seletor Aleatório",
                groupGames: "Jogos em Grupo",
                usefulTools: "Ferramentas Úteis",
                contactUs: "Entre em Contato",
                location: "Riad, Arábia Saudita",
                mobileApp: "Aplicativo Móvel",
                downloadApp: "Baixe nosso aplicativo agora para uma melhor experiência",
                allRights: "Todos os Direitos Reservados",
                designedWith: "Desenhado com",
                inSaudi: "na Arábia Saudita",
                congratulations: "Parabéns!",
                selectedName: "O nome selecionado é:",
                ok: "OK",
                confirmClear: "Confirmar Limpeza",
                clearAllMessage: "Tem certeza de que deseja limpar todos os nomes?",
                cannotUndo: "Esta ação não pode ser desfeita",
                cancel: "Cancelar",
                names: "Nomes",
                addNameSuccess: "Nome adicionado com sucesso",
                nameExists: "O nome já existe",
                noNames: "Por favor, adicione nomes primeiro",
                resetConfirm: "Tem certeza de que deseja redefinir a roda?",
                resetComplete: "Roda redefinida para nomes padrão",
                clearComplete: "Todos os nomes limpos",
                nameDeleted: "Nome excluído",
                noNewNames: "Nenhum novo nome encontrado",
                linkCopied: "Link copiado para a área de transferência"
            },
            ru: {
                logo: "Колесо Имен",
                menuTitle: "Главное Меню",
                menuSubtitle: "Выберите из меню ниже",
                spinWheel: "Крутить Колесо",
                reset: "Сброс",
                clearAll: "Очистить Все",
                share: "Поделиться",
                aboutUs: "О Нас",
                privacy: "Политика Конфиденциальности",
                contact: "Свяжитесь с Нами",
                clickToSpin: "Нажмите для Вращения",
                winner: "Победитель!",
                addSingleName: "Добавить Одно Имя",
                enterName: "Введите имя",
                add: "Добавить",
                addMultipleNames: "Добавить Несколько Имен",
                pasteNames: "Вставьте имена здесь (каждое имя на новой строке или разделенное запятыми)",
                pasteHint: "💡 Вы можете вставить список имен, разделенных запятыми или переносами строк",
                addNames: "Добавить Имена",
                namesCount: "Количество Имен:",
                toggleView: "Переключить Вид",
                quickLinks: "Быстрые Ссылки",
                terms: "Условия Использования",
                ourServices: "Наши Услуги",
                wheelOfNames: "Колесо Имен",
                randomPicker: "Случайный Выбор",
                groupGames: "Групповые Игры",
                usefulTools: "Полезные Инструменты",
                contactUs: "Свяжитесь с Нами",
                location: "Эр-Рияд, Саудовская Аравия",
                mobileApp: "Мобильное Приложение",
                downloadApp: "Скачайте наше приложение сейчас для лучшего опыта",
                allRights: "Все Права Защищены",
                designedWith: "Разработано с",
                inSaudi: "в Саудовской Аравии",
                congratulations: "Поздравляем!",
                selectedName: "Выбранное имя:",
                ok: "ОК",
                confirmClear: "Подтвердить Очистку",
                clearAllMessage: "Вы уверены, что хотите очистить все имена?",
                cannotUndo: "Это действие нельзя отменить",
                cancel: "Отмена",
                names: "Имена",
                addNameSuccess: "Имя успешно добавлено",
                nameExists: "Имя уже существует",
                noNames: "Пожалуйста, сначала добавьте имена",
                resetConfirm: "Вы уверены, что хотите сбросить колесо?",
                resetComplete: "Колесо сброшено к именам по умолчанию",
                clearComplete: "Все имена очищены",
                nameDeleted: "Имя удалено",
                noNewNames: "Новые имена не найдены",
                linkCopied: "Ссылка скопирована в буфер обмена"
            },
            hi: {
                logo: "नाम का पहिया",
                menuTitle: "मुख्य मेनू",
                menuSubtitle: "नीचे दिए गए मेनू से चुनें",
                spinWheel: "पहिया घुमाएं",
                reset: "रीसेट",
                clearAll: "सभी साफ करें",
                share: "साझा करें",
                aboutUs: "हमारे बारे में",
                privacy: "गोपनीयता नीति",
                contact: "संपर्क करें",
                clickToSpin: "घुमाने के लिए क्लिक करें",
                winner: "विजेता!",
                addSingleName: "एक नाम जोड़ें",
                enterName: "नाम दर्ज करें",
                add: "जोड़ें",
                addMultipleNames: "कई नाम जोड़ें",
                pasteNames: "यहां नाम पेस्ट करें (प्रत्येक नाम नई लाइन पर या अल्पविराम से अलग)",
                pasteHint: "💡 आप अल्पविराम या लाइन ब्रेक से अलग किए गए नामों की सूची पेस्ट कर सकते हैं",
                addNames: "नाम जोड़ें",
                namesCount: "नामों की संख्या:",
                toggleView: "दृश्य टॉगल करें",
                quickLinks: "त्वरित लिंक",
                terms: "नियम और शर्तें",
                ourServices: "हमारी सेवाएं",
                wheelOfNames: "नाम का पहिया",
                randomPicker: "यादृच्छिक चयनकर्ता",
                groupGames: "समूह खेल",
                usefulTools: "उपयोगी उपकरण",
                contactUs: "संपर्क करें",
                location: "रियाद, सऊदी अरब",
                mobileApp: "मोबाइल ऐप",
                downloadApp: "बेहतर अनुभव के लिए अभी हमारा ऐप डाउनलोड करें",
                allRights: "सभी अधिकार सुरक्षित",
                designedWith: "के साथ डिज़ाइन किया गया",
                inSaudi: "सऊदी अरब में",
                congratulations: "बधाई हो!",
                selectedName: "चयनित नाम है:",
                ok: "ठीक है",
                confirmClear: "साफ करने की पुष्टि करें",
                clearAllMessage: "क्या आप सभी नामों को साफ करना चाहते हैं?",
                cannotUndo: "इस कार्य को पूर्ववत नहीं किया जा सकता",
                cancel: "रद्द करें",
                names: "नाम",
                addNameSuccess: "नाम सफलतापूर्वक जोड़ा गया",
                nameExists: "नाम पहले से मौजूद है",
                noNames: "कृपया पहले नाम जोड़ें",
                resetConfirm: "क्या आप पहिया रीसेट करना चाहते हैं?",
                resetComplete: "पहिया डिफ़ॉल्ट नामों पर रीसेट हो गया",
                clearComplete: "सभी नाम साफ हो गए",
                nameDeleted: "नाम हटा दिया गया",
                noNewNames: "कोई नए नाम नहीं मिले",
                linkCopied: "लिंक क्लिपबोर्ड में कॉपी हो गया"
            }
        };

        let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        
        function toggleLanguageDropdown() {
            const dropdown = document.getElementById('languageDropdown');
            dropdown.classList.toggle('active');
        }

        function changeLanguage(lang) {
            currentLanguage = lang;
            localStorage.setItem('selectedLanguage', lang);
            document.documentElement.lang = lang;
            if (lang === 'ar' || lang === 'he' || lang === 'fa') {
                document.body.dir = 'rtl';
            } else {
                document.body.dir = 'ltr';
            }
            translatePage();
        }

        function translatePage() {
            const elements = document.querySelectorAll('[data-translate]');
            elements.forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[currentLanguage] && translations[currentLanguage][key]) {
                    element.textContent = translations[currentLanguage][key];
                }
            });
            const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
            placeholderElements.forEach(element => {
                const key = element.getAttribute('data-translate-placeholder');
                if (translations[currentLanguage] && translations[currentLanguage][key]) {
                    element.placeholder = translations[currentLanguage][key];
                }
            });
        }
        
        let names = ['Eric', 'Fatima', 'Diyaa', 'Ali', 'Beatriz', 'Charles', 'Gabriel', 'Hana'];
        let currentWinnerIndex = -1;
        let isSpinning = false;
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788', '#FF8CC8', '#6C5CE7', '#A29BFE', '#FD79A8', '#FAB1A0', '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894', '#00CEC9'];

        const canvas = document.getElementById('wheelCanvas');
        const ctx = canvas.getContext('2d');
        const nameInput = document.getElementById('nameInput');
        const addNameBtn = document.getElementById('addNameBtn');
        const namesTextarea = document.getElementById('namesTextarea');
        const pasteNamesBtn = document.getElementById('pasteNamesBtn');
        const namesList = document.getElementById('namesList');
        const namesCount = document.getElementById('namesCount');
        const perfNamesCount = document.getElementById('perfNamesCount');
        const fpsCounter = document.getElementById('fpsCounter');
        const spinBtn = document.getElementById('spinBtn');
        const resetBtn = document.getElementById('resetBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const shareBtn = document.getElementById('shareBtn');
        const resultModal = document.getElementById('resultModal');
        const clearConfirmModal = document.getElementById('clearConfirmModal');
        const winnerName = document.getElementById('winnerName');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const confirmClearBtn = document.getElementById('confirmClearBtn');
        const cancelClearBtn = document.getElementById('cancelClearBtn');
        const toggleViewBtn = document.getElementById('toggleViewBtn');
        const winnerHighlight = document.getElementById('winnerHighlight');
        const winnerLabel = document.getElementById('winnerLabel');
        let isVirtualMode = false;
        let lastFrameTime = performance.now();
        let frameCount = 0;
        let fps = 60;

        function setupCanvas() {
            const containerWidth = canvas.parentElement.offsetWidth;
            canvas.width = containerWidth;
            canvas.height = containerWidth;
        }

        function drawWheel() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 10;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (names.length === 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fillStyle = '#e0e0e0';
                ctx.fill();
                ctx.fillStyle = '#666';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(translations[currentLanguage].noNames || 'Add names to start', centerX, centerY);
                return;
            }
            const anglePerName = (2 * Math.PI) / names.length;
            ctx.save();
            names.forEach((name, i) => {
                const startAngle = i * anglePerName - Math.PI / 2;
                const endAngle = (i + 1) * anglePerName - Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                if (i === currentWinnerIndex) {
                    ctx.fillStyle = '#FFD700';
                    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                    ctx.shadowBlur = 20;
                } else {
                    ctx.fillStyle = colors[i % colors.length];
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = names.length > 50 ? 1 : 3;
                ctx.stroke();
            });
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.font = names.length > 50 ? 'bold 14px Arial' : 'bold 18px Arial';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 3;
            names.forEach((name, i) => {
                const startAngle = i * anglePerName - Math.PI / 2;
                const textRadius = radius * (names.length > 50 ? 0.75 : 0.65);
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(startAngle + anglePerName / 2);
                if (i === currentWinnerIndex) {
                    ctx.fillStyle = '#333';
                    ctx.font = names.length > 50 ? 'bold 16px Arial' : 'bold 20px Arial';
                    ctx.shadowColor = 'rgba(0,0,0,0.8)';
                    ctx.shadowBlur = 5;
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.font = names.length > 50 ? 'bold 14px Arial' : 'bold 18px Arial';
                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    ctx.shadowBlur = 3;
                }
                let displayName = name;
                if (name.length > 15) {
                    displayName = name.substring(0, 12) + '...';
                }
                ctx.fillText(displayName, textRadius, 0);
                ctx.restore();
            });
            ctx.restore();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
            ctx.fillStyle = '#333';
            ctx.fill();
        }

        function updateNamesList() {
            namesCount.textContent = names.length;
            perfNamesCount.textContent = names.length;
            if (names.length === 0) {
                namesList.innerHTML = \`<p style="text-align: center; color: #999;">\${translations[currentLanguage].noNames || 'No names added'}</p>\`;
                return;
            }
            if (names.length > 100 && !isVirtualMode) {
                showVirtualList();
                return;
            }
            if (isVirtualMode) {
                updateVirtualList();
                return;
            }
            const fragment = document.createDocumentFragment();
            names.forEach((name, index) => {
                const nameItem = createNameItem(name, index);
                fragment.appendChild(nameItem);
            });
            namesList.innerHTML = '';
            namesList.appendChild(fragment);
        }

        function createNameItem(name, index) {
            const nameItem = document.createElement('div');
            nameItem.className = 'name-item';
            if (index === currentWinnerIndex) {
                nameItem.classList.add('winner');
            }
            const nameText = document.createElement('span');
            nameText.className = 'name-text';
            nameText.textContent = name;
            nameText.title = name;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = translations[currentLanguage].delete || 'Delete';
            deleteBtn.onclick = () => deleteName(index);
            nameItem.appendChild(nameText);
            nameItem.appendChild(deleteBtn);
            return nameItem;
        }

        function showVirtualList() {
            isVirtualMode = true;
            namesList.className = 'names-list-virtual';
            namesList.innerHTML = \`
                <div style="padding: 20px; text-align: center; color: #666;">
                    <p>📊 \${names.length} \${translations[currentLanguage].names || 'names'} in list</p>
                    <p style="font-size: 14px; margin-top: 10px;">\${translations[currentLanguage].virtualMode || 'Virtual view enabled for better performance'}</p>
                    \${currentWinnerIndex >= 0 ? \`<p style="margin-top: 10px; color: #FFD700; font-weight: bold;">🏆 \${translations[currentLanguage].winner || 'Winner'}: \${names[currentWinnerIndex]}</p>\` : ''}
                    <button onclick="showNormalList()" style="margin-top: 10px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        \${translations[currentLanguage].showAll || 'Show All'}
                    </button>
                </div>
            \`;
        }
        window.showNormalList = function() {
            isVirtualMode = false;
            namesList.className = 'names-list';
            updateNamesList();
        }

        function updateVirtualList() {
            if (!isVirtualMode) return;
            const visibleCount = Math.min(50, names.length);
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < visibleCount; i++) {
                const nameItem = createNameItem(names[i], i);
                fragment.appendChild(nameItem);
            }
            if (names.length > 50) {
                const moreItem = document.createElement('div');
                moreItem.style.cssText = 'text-align: center; padding: 10px; color: #666;';
                moreItem.textContent = \`... and \${names.length - 50} more names\`;
                fragment.appendChild(moreItem);
            }
            namesList.innerHTML = '';
            namesList.appendChild(fragment);
        }

        let addNameTimeout;
        function addName() {
            clearTimeout(addNameTimeout);
            addNameTimeout = setTimeout(() => {
                const name = nameInput.value.trim();
                if (name && !names.includes(name)) {
                    names.push(name);
                    nameInput.value = '';
                    requestAnimationFrame(updateNamesList);
                    showNotification(translations[currentLanguage].addNameSuccess || 'Name added successfully');
                } else if (names.includes(name)) {
                    showNotification(translations[currentLanguage].nameExists || 'Name already exists', 'warning');
                }
            }, 100);
        }

        function addMultipleNames() {
            const text = namesTextarea.value.trim();
            if (!text) return;
            const newNames = text.split(/[,،\\n]+/).map(name => name.trim()).filter(name => name && !names.includes(name));
            if (newNames.length > 0) {
                names.push(...newNames);
                namesTextarea.value = '';
                requestAnimationFrame(() => {
                    updateNamesList();
                    drawWheel();
                });
                showNotification(\`\${newNames.length} \${translations[currentLanguage].names || 'names'} added successfully\`);
            } else {
                showNotification(translations[currentLanguage].noNewNames || 'No new names found', 'warning');
            }
        }

        function deleteName(index) {
            names.splice(index, 1);
            if (currentWinnerIndex === index) {
                currentWinnerIndex = -1;
                hideWinnerHighlight();
            } else if (currentWinnerIndex > index) {
                currentWinnerIndex--;
            }
            requestAnimationFrame(() => {
                updateNamesList();
                drawWheel();
            });
            showNotification(translations[currentLanguage].nameDeleted || 'Name deleted');
        }

        function showWinnerHighlight(winnerName) {
            winnerHighlight.style.opacity = '1';
            winnerLabel.innerHTML = \`🏆 \${translations[currentLanguage].winner || 'Winner'}: \${winnerName}\`;
            winnerLabel.style.opacity = '1';
        }

        function hideWinnerHighlight() {
            winnerHighlight.style.opacity = '0';
            winnerLabel.style.opacity = '0';
        }

        function createConfetti() {
            const colors = ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#98FB98'];
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.left = Math.random() * 100 + '%';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.animationDelay = Math.random() * 0.5 + 's';
                    document.body.appendChild(confetti);
                    setTimeout(() => confetti.remove(), 3000);
                }, i * 30);
            }
        }

        function createClickEffect(x, y) {
            const effect = document.createElement('div');
            effect.className = 'click-effect';
            effect.style.left = x + 'px';
            effect.style.top = y + 'px';
            effect.style.width = '20px';
            effect.style.height = '20px';
            canvas.parentElement.appendChild(effect);
            setTimeout(() => effect.remove(), 600);
        }

        function spinWheel(source = 'button') {
            if (names.length === 0) {
                showNotification(translations[currentLanguage].noNames || 'Please add names first', 'error');
                return;
            }
            if (isSpinning) return;
            hideWinnerHighlight();
            currentWinnerIndex = -1;
            isSpinning = true;
            spinBtn.disabled = true;
            canvas.classList.add('spinning');
            const spins = Math.floor(Math.random() * 8) + 8;
            const finalAngle = Math.random() * 360;
            const totalRotation = spins * 360 + finalAngle;
            canvas.style.transform = \`rotate(\${totalRotation}deg)\`;
            setTimeout(() => {
                const segmentAngle = 360 / names.length;
                const normalizedAngle = totalRotation % 360;
                currentWinnerIndex = Math.floor((360 - normalizedAngle) / segmentAngle) % names.length;
                const winner = names[currentWinnerIndex];
                requestAnimationFrame(() => {
                    drawWheel();
                    showWinnerHighlight(winner);
                    updateNamesList();
                });
                winnerName.textContent = winner;
                resultModal.style.display = 'flex';
                createConfetti();
                isSpinning = false;
                spinBtn.disabled = false;
                canvas.classList.remove('spinning');
            }, 3000);
        }

        function resetWheel() {
            if (confirm(translations[currentLanguage].resetConfirm || 'Are you sure you want to reset the wheel?')) {
                names = ['Eric', 'Fatima', 'Diyaa', 'Ali', 'Beatriz', 'Charles', 'Gabriel', 'Hana'];
                currentWinnerIndex = -1;
                canvas.style.transform = 'rotate(0deg)';
                isVirtualMode = false;
                namesList.className = 'names-list';
                hideWinnerHighlight();
                requestAnimationFrame(() => {
                    updateNamesList();
                    drawWheel();
                });
                showNotification(translations[currentLanguage].resetComplete || 'Wheel reset to default names');
            }
        }

        function clearAllNames() {
            clearConfirmModal.style.display = 'flex';
        }

        function executeClearAll() {
            names = [];
            currentWinnerIndex = -1;
            canvas.style.transform = 'rotate(0deg)';
            isVirtualMode = false;
            namesList.className = 'names-list';
            hideWinnerHighlight();
            requestAnimationFrame(() => {
                updateNamesList();
                drawWheel();
            });
            clearConfirmModal.style.display = 'none';
            showNotification(translations[currentLanguage].clearComplete || 'All names cleared');
        }

        function cancelClearAll() {
            clearConfirmModal.style.display = 'none';
        }

        function shareWheel() {
            const namesParam = encodeURIComponent(JSON.stringify(names));
            const url = \`\${window.location.origin}\${window.location.pathname}?names=\${namesParam}\`;
            if (navigator.share) {
                navigator.share({ title: 'Wheel of Names', text: 'Join the Wheel of Names!', url: url });
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    showNotification(translations[currentLanguage].linkCopied || 'Link copied to clipboard');
                });
            }
        }

        function loadNamesFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            const namesParam = urlParams.get('names');
            if (namesParam) {
                try {
                    names = JSON.parse(decodeURIComponent(namesParam));
                    requestAnimationFrame(() => {
                        updateNamesList();
                        drawWheel();
                    });
                } catch (e) {
                    console.error('Failed to load names from URL', e);
                }
            }
        }

        function closeModal() {
            resultModal.style.display = 'none';
        }

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.style.cssText = \`
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%); padding: 15px 25px;
                background: \${type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : '#f44336'};
                color: white; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                z-index: 2000; animation: slideDown 0.3s ease;\`
            ;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.animation = 'slideUp 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        function updateFPS() {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastFrameTime;
            frameCount++;
            if (deltaTime >= 1000) {
                fps = Math.round((frameCount * 1000) / deltaTime);
                fpsCounter.textContent = fps;
                frameCount = 0;
                lastFrameTime = currentTime;
            }
            requestAnimationFrame(updateFPS);
        }

        function toggleView() {
            if (isVirtualMode) {
                showNormalList();
            } else {
                showVirtualList();
            }
        }

        addNameBtn.addEventListener('click', addName);
        nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addName(); });
        pasteNamesBtn.addEventListener('click', addMultipleNames);
        spinBtn.addEventListener('click', () => spinWheel('button'));
        canvas.addEventListener('click', (e) => {
            if (!isSpinning) {
                createClickEffect(e.clientX, e.clientY);
                spinWheel('wheel');
            }
        });
        resetBtn.addEventListener('click', resetWheel);
        clearAllBtn.addEventListener('click', clearAllNames);
        confirmClearBtn.addEventListener('click', executeClearAll);
        cancelClearBtn.addEventListener('click', cancelClearAll);
        shareBtn.addEventListener('click', shareWheel);
        closeModalBtn.addEventListener('click', closeModal);
        toggleViewBtn.addEventListener('click', toggleView);
        window.addEventListener('resize', () => { setupCanvas(); drawWheel(); });
        resultModal.addEventListener('click', (e) => { if (e.target === resultModal) closeModal(); });
        clearConfirmModal.addEventListener('click', (e) => { if (e.target === clearConfirmModal) cancelClearAll(); });
        
        function initializePage() {
            setupCanvas();
            changeLanguage(currentLanguage);
            loadNamesFromURL();
            updateNamesList();
            drawWheel();
            updateFPS();
        }
        
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
            @keyframes slideUp { from { transform: translate(-50%, 0); opacity: 1; } to { transform: translate(-50%, -100%); opacity: 0; } }
        \`;
        document.head.appendChild(style);
        
        initializePage();
    </script>
</body>
</html>
`;

const WheelOfFortuneTool: React.FC = () => {
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">عجلة الحظ</h2>
            <p className="text-brand-light mb-6">عجلة أسماء تفاعلية لاختيار فائز عشوائي من قائمة.</p>
            <iframe
                srcDoc={wheelOfFortuneHtml}
                title="Wheel of Fortune"
                className="w-full h-full flex-grow border-0 rounded-lg bg-brand-dark"
                style={{ minHeight: '80vh' }}
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
};

export default WheelOfFortuneTool;

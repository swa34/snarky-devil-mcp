/* ========================================
   Snarky Devil MCP — Live Demo Logic
   Mock responses only. No real API calls.
   ======================================== */

(function () {
  'use strict';

  // --- Mock Response Data ---

  const snapBackResponses = [
    {
      snark: "Oh sure, that answer sounds great if you've never actually tried it in production. It's the kind of advice that looks brilliant on a whiteboard and catastrophic in a git blame.",
      confidence: "medium"
    },
    {
      snark: "Wow, what a refreshingly safe take. You know what else is safe? Never shipping anything. That answer has the same energy as 'just follow best practices' — technically correct and utterly useless.",
      confidence: "high"
    },
    {
      snark: "I love how confidently wrong that is. It's like watching someone explain why their house isn't on fire while standing in front of a burning house. The conviction is almost admirable.",
      confidence: "low"
    },
    {
      snark: "That's the kind of answer you give when you want to sound smart in a meeting but don't want to be held accountable for anything. Peak consultancy energy right there.",
      confidence: "medium"
    }
  ];

  const coldTakeResponses = {
    mild: [
      {
        snark: "Hot take: that thing everyone loves? It's fine. Just fine. Not great, not terrible. The room-temperature take that nobody asked for but here we are.",
        confidence: "low"
      },
      {
        snark: "Unpopular opinion: the old way was actually pretty okay. Not everything needs to be disrupted. Sometimes 'boring' is just another word for 'works reliably.'",
        confidence: "medium"
      }
    ],
    spicy: [
      {
        snark: "Here's the thing nobody wants to admit: half the industry is just cargo-culting whatever the last conference talk said. We don't adopt tools because they're good — we adopt them because the alternative is admitting we don't know what we're doing.",
        confidence: "high"
      },
      {
        snark: "Every time someone says that's 'the future,' what they mean is 'I just learned about this and my confirmation bias needs validation.' The future is whatever ships, and most of this won't.",
        confidence: "medium"
      }
    ],
    unhinged: [
      {
        snark: "Okay hear me out — what if the entire concept is actually a mass hallucination sustained by venture capital and Stockholm syndrome? We've all just been nodding along for years because the alternative is confronting the void.",
        confidence: "high"
      },
      {
        snark: "This is what happens when you let people with podcasts make architectural decisions. The whole thing is a house of cards held together by npm install and prayers. And honestly? I respect the audacity.",
        confidence: "low"
      }
    ]
  };

  // --- DOM Elements ---

  const toolSelect = document.getElementById('tool-select');
  const inputsSnapBack = document.getElementById('inputs-snap-back');
  const inputsColdTake = document.getElementById('inputs-cold-take');
  const submitBtn = document.getElementById('demo-submit');
  const outputSection = document.getElementById('demo-output');
  const outputSnark = document.getElementById('output-snark');
  const confidenceMeter = document.getElementById('confidence-meter');

  // Input fields
  const inputQuestion = document.getElementById('input-question');
  const inputAnswer = document.getElementById('input-answer');
  const inputTopic = document.getElementById('input-topic');
  const inputIntensity = document.getElementById('input-intensity');

  // Install tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // --- Tool Selector ---

  toolSelect.addEventListener('change', function () {
    const tool = this.value;
    if (tool === 'snap_back') {
      inputsSnapBack.classList.remove('hidden');
      inputsColdTake.classList.add('hidden');
    } else {
      inputsSnapBack.classList.add('hidden');
      inputsColdTake.classList.remove('hidden');
    }
    // Hide output when switching tools
    outputSection.classList.add('hidden');
  });

  // --- Install Tabs ---

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetTab = this.getAttribute('data-tab');

      tabBtns.forEach(function (b) { b.classList.remove('active'); });
      tabContents.forEach(function (c) { c.classList.remove('active'); });

      this.classList.add('active');
      document.getElementById('tab-' + targetTab).classList.add('active');
    });
  });

  // --- Mock Response Picker ---

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getMockResponse(tool) {
    if (tool === 'snap_back') {
      return pickRandom(snapBackResponses);
    } else {
      var intensity = inputIntensity.value;
      return pickRandom(coldTakeResponses[intensity]);
    }
  }

  // --- Confidence Display ---

  function renderConfidence(level) {
    var displays = {
      low: '\uD83D\uDD25',
      medium: '\uD83D\uDD25\uD83D\uDD25',
      high: '\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25'
    };
    var labels = {
      low: ' low — even we don\'t buy this one',
      medium: ' medium — plausibly wrong',
      high: ' high — hill we\'ll die on'
    };
    confidenceMeter.innerHTML = '<span>' + displays[level] + '</span><span style="color: var(--text-dim); font-size: 0.8rem; letter-spacing: 0;">' + labels[level] + '</span>';
  }

  // --- Typing Animation ---

  var typingTimeout = null;

  function typeText(element, text, callback) {
    // Clear any previous typing animation
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    element.textContent = '';
    var cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    element.appendChild(cursor);

    var index = 0;
    // Faster for long text, slower for short
    var baseSpeed = Math.max(8, Math.min(30, 800 / text.length));

    function typeNext() {
      if (index < text.length) {
        // Insert character before the cursor
        var textNode = document.createTextNode(text.charAt(index));
        element.insertBefore(textNode, cursor);
        index++;

        // Slight randomness for natural feel
        var delay = baseSpeed + Math.random() * 15;
        // Slow down at punctuation
        if ('.!?,;:'.indexOf(text.charAt(index - 1)) !== -1) {
          delay += 80;
        }

        typingTimeout = setTimeout(typeNext, delay);
      } else {
        // Remove cursor when done
        setTimeout(function () {
          if (cursor.parentNode) {
            cursor.parentNode.removeChild(cursor);
          }
          if (callback) callback();
        }, 600);
      }
    }

    typeNext();
  }

  // --- Submit Handler ---

  submitBtn.addEventListener('click', function () {
    var tool = toolSelect.value;

    // Basic validation
    if (tool === 'snap_back') {
      if (!inputQuestion.value.trim() || !inputAnswer.value.trim()) {
        shakeButton();
        return;
      }
    } else {
      if (!inputTopic.value.trim()) {
        shakeButton();
        return;
      }
    }

    // Disable button during animation
    submitBtn.disabled = true;
    submitBtn.textContent = 'Conjuring malice...';
    submitBtn.style.opacity = '0.6';

    // Show output area
    outputSection.classList.remove('hidden');
    outputSnark.textContent = '';
    confidenceMeter.textContent = '';

    // Simulate a brief "thinking" delay
    setTimeout(function () {
      var response = getMockResponse(tool);

      typeText(outputSnark, response.snark, function () {
        renderConfidence(response.confidence);
      });

      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Ruin Someone\'s Day';
      submitBtn.style.opacity = '1';
    }, 600 + Math.random() * 400);
  });

  // --- Shake animation for empty inputs ---

  function shakeButton() {
    submitBtn.style.animation = 'shake 0.4s ease';
    submitBtn.addEventListener('animationend', function handler() {
      submitBtn.style.animation = '';
      submitBtn.removeEventListener('animationend', handler);
    });
  }

  // Add shake keyframes dynamically
  var shakeStyle = document.createElement('style');
  shakeStyle.textContent = '@keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }';
  document.head.appendChild(shakeStyle);

})();

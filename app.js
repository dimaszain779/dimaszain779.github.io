        document.addEventListener('DOMContentLoaded', () => {
            const recordBtn = document.getElementById('recordBtn');
            const btnText = document.getElementById('btnText');
            const result = document.getElementById('result');
            const status = document.getElementById('status');
            const languageSelect = document.getElementById('languageSelect');
            const fontSizeSelect = document.getElementById('fontSizeSelect');
            const fontFamilySelect = document.getElementById('fontFamilySelect');
            const themeToggleButton = document.getElementById('themeToggleButton');
            const moonIcon = document.getElementById('moon-icon');
            const sunIcon = document.getElementById('sun-icon');
            const copyBtn = document.getElementById('copyBtn');
            const clearBtn = document.getElementById('clearBtn');
            const waveform = document.getElementById('waveform');
            const bars = waveform.querySelectorAll('.bar');
            
            let recognition;
            let isRecording = false;
            let animationId;
            let langMap = {
                'id-ID': { start: 'Mulai Merekam', stop: 'Berhenti Merekam', guide: 'Tekan tombol di atas untuk mulai merekam' },
                'en-US': { start: 'Start Recording', stop: 'Stop Recording', guide: 'Press the button above to start recording' },
                'jv-ID': { start: 'Miwiti Ngrekam', stop: 'Mungkasi Ngrekam', guide: 'Pencet tombol ing ndhuwur kanggo miwiti ngrekam' }
            };

            // Inisialisasi SpeechRecognition
            try {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognition = new SpeechRecognition();
                recognition.continuous = true;
                
                recognition.onstart = () => {
                    isRecording = true;
                    recordBtn.classList.add('pulse');
                    updateButtonText();
                    updateStatus(isRecording ? 'Mendengarkan...' : `${getTranslation('guide')}`);
                    animateWaveform();
                };
                
                recognition.onend = () => {
                    if (isRecording) {
                        recognition.start(); // Restart jika masih dalam mode recording
                    } else {
                        recordBtn.classList.remove('pulse');
                        cancelAnimationFrame(animationId);
                        resetWaveform();
                    }
                };
                
                recognition.onresult = (event) => {
                    const transcript = Array.from(event.results)
                        .map(result => result[0])
                        .map(result => result.transcript)
                        .join('');
                    
                    result.value = transcript;
                };
                
                recognition.onerror = (event) => {
                    console.error('Error occurred in recognition:', event.error);
                    status.textContent = `Error: ${event.error}`;
                };
                
            } catch (e) {
                status.innerHTML = 'Browser Anda tidak mendukung Speech Recognition API. Silakan gunakan Chrome, Edge, atau Firefox versi terbaru.';
                recordBtn.disabled = true;
            }

            themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            // Mengubah teks tombol sesuai tema
            if (document.body.classList.contains('dark-mode')) {
                themeToggleButton.textContent = '🌙';
                } else {
                themeToggleButton.textContent = '☀️';
            }
        });
            // Event listeners
            recordBtn.addEventListener('click', toggleRecording);
            languageSelect.addEventListener('change', updateLanguage);
            copyBtn.addEventListener('click', copyText);
            clearBtn.addEventListener('click', clearText);

             // Event listeners baru untuk pengaturan font
            fontSizeSelect.addEventListener('change', (event) => {
                result.style.fontSize = `${event.target.value}px`;
            });
            fontFamilySelect.addEventListener('change', (event) => {
                result.style.fontFamily = event.target.value;
            });

            // Fungsi untuk memulai/menghentikan rekaman
            function toggleRecording() {
                if (!recognition) return;
                
                if (isRecording) {
                    recognition.stop();
                    isRecording = false;
                } else {
                    recognition.lang = languageSelect.value;
                    recognition.start();
                }
                
                updateButtonText();
            }

            // Fungsi untuk mengupdate teks tombol berdasarkan bahasa
            function updateButtonText() {
                btnText.textContent = isRecording ? 
                    getTranslation('stop') : 
                    getTranslation('start');
            }

            // Fungsi untuk mendapatkan terjemahan
            function getTranslation(key) {
                const lang = languageSelect.value;
                return langMap[lang][key] || key;
            }

            // Fungsi untuk update UI saat bahasa berubah
            function updateLanguage() {
                if (isRecording) {
                    recognition.stop();
                    isRecording = false;
                }
                updateButtonText();
                updateStatus(`${getTranslation('guide')}`);

                // Update teks panduan
                const guideItems = document.querySelectorAll('.bg-blue-50 ol li');
                if (languageSelect.value === 'en-US') {
                    guideItems[0].textContent = 'Select the language you want to use';
                    guideItems[1].textContent = 'Click the "Start Recording" button';
                    guideItems[2].textContent = 'Speak clearly and slowly';
                    guideItems[3].textContent = 'Click the button again to stop recording';
                    guideItems[4].textContent = 'The transcription will appear in the text box';
                } else if (languageSelect.value === 'jv-ID') {
                    guideItems[0].textContent = 'Pilih basa sing arep digunakake';
                    guideItems[1].textContent = 'Pencet tombol "Miwiti Ngrekam"';
                    guideItems[2].textContent = 'Ngomong kanthi jelas lan alon-alon';
                    guideItems[3].textContent = 'Pencet tombol maneh kanggo mungkasi ngrekam';
                    guideItems[4].textContent = 'Hasil transkripsi bakal muncul ing kothak teks';
                } else {
                    guideItems[0].textContent = 'Pilih bahasa yang ingin digunakan';
                    guideItems[1].textContent = 'Tekan tombol "Mulai Merekam"';
                    guideItems[2].textContent = 'Berbicara dengan jelas dan pelan-pelan';
                    guideItems[3].textContent = 'Tekan tombol lagi untuk menghentikan rekaman';
                    guideItems[4].textContent = 'Hasil transkripsi akan muncul di kotak teks';
                }
            }

            // Fungsi untuk copy teks
            function copyText() {
                result.select();
                document.execCommand('copy');
                const lang = languageSelect.value;
                const msg = lang === 'en-US' ? 'Text copied!' : 
                           lang === 'jv-ID' ? 'Teks wis disalin!' : 'Teks telah disalin!';
                
                status.textContent = msg;
                setTimeout(() => {
                    updateStatus(`${getTranslation('guide')}`);
                }, 2000);
            }

            // Fungsi untuk menghapus teks
            function clearText() {
                result.value = '';
                updateStatus(`${getTranslation('guide')}`);
                
            }

            // Fungsi untuk update status
            function updateStatus(message) {
                status.textContent = message;
            }

            // Animasi waveform
            function animateWaveform() {
                if (!isRecording) return;
                
                bars.forEach(bar => {
                    const height = Math.random() * 30 + 10;
                    bar.style.height = `${height}px`;
                });
                
                animationId = requestAnimationFrame(animateWaveform);
            }

            function resetWaveform() {
                bars.forEach(bar => {
                    bar.style.height = '10px';
                });
            }
        });

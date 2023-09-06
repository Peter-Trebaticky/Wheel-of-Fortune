document.addEventListener("DOMContentLoaded", () => {
                const colors = ["#349D9D", "#FF0D05", "#1F235C", "#5CC653", "#A03CB4", "#D9A88C", "#434517", "#552163", "#B43C60", "#0051FF", "#B488D7", "#67FF3D"];
                const prizeMenu = document.querySelector("#prizes");
                const elSpin = document.querySelector("#spin");
                const result = document.querySelector("#result");
                const latestPrize = document.querySelector("#latestPrize");
                const ctx = document.querySelector("#wheel").getContext("2d");
                const dia = ctx.canvas.width;
                const rad = dia / 2;
                const PI = Math.PI;
                const TAU = 2 * PI;
                let numPrizes = 0;
                const friction = 0.991;
                const angVelMin = 0.002;
                let angVelMax = 0;
                let angVel = 0;
                let ang = 0;
                let isSpinning = false;
                let isAccelerating = false;
                let animFrame = null;

                function createPrizeElement(value) {
                    const li = document.createElement("li");
                    li.className = "prizeWithRemove";

                    const span = document.createElement("span");
                    span.className = "prize";
                    span.textContent = value.toString();

                    const a = document.createElement("a");
                    a.className = "removePrize";
                    a.textContent = "×";
                    a.addEventListener("click", () => removePrize(li));

                    li.appendChild(span);
                    li.appendChild(a);

                    return li;
                }

                function removePrize(prizeElement) {
                    const prizeIndex = Array.from(prizeMenu.querySelectorAll(".prizeWithRemove")).indexOf(prizeElement);
                    if (prizeIndex !== -1) {
                        prizeMenu.removeChild(prizeElement);
                        defaultPrizeValues.splice(prizeIndex, 1);
                        numPrizes--;
                        ctx.clearRect(0, 0, dia, dia);
                        defaultPrizeValues.forEach((value, i) => {
                            drawSector(colors[i], value, i);
                        });
                        rotate();
                    }
                }

                function addPrizeToListAndWheel(value) {
                    const prizeElement = createPrizeElement(value);
                    prizeMenu.appendChild(prizeElement);
                    defaultPrizeValues.push(value);
                    numPrizes++;
                    ctx.clearRect(0, 0, dia, dia);
                    defaultPrizeValues.forEach((value, i) => {
                        drawSector(colors[i], value, i);
                    });
                    rotate();
                }

                function drawSector(color, value, i) {
                    const ang = TAU / numPrizes;
                    ctx.save();
                    //color
                    const colorIndex = i % colors.length;
                    ctx.beginPath();
                    ctx.fillStyle = colors[colorIndex];
                    ctx.moveTo(rad, rad);
                    ctx.arc(rad, rad, rad, ang * i, ang * (i + 1));
                    ctx.lineTo(rad, rad);
                    ctx.fill();
                    //text
                    ctx.translate(rad, rad);
                    ctx.rotate(ang * (i + 0.5));
                    ctx.textAlign = "right";
                    ctx.fillStyle = "#fff";
                    ctx.font = "bold 30px sans-serif";
                    ctx.fillText(value.toString(), rad - 10, 10);
                    ctx.restore();
                }

                //rotate 
                function rotate() {
                    const index = Math.floor(numPrizes - ang / TAU * numPrizes) % numPrizes;
                    const value = defaultPrizeValues[index];
                    if (value) {
                        const color = colors[index];
                        ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
                        elSpin.textContent = !angVel ? "SPIN" : value.toString();
                        elSpin.style.background = color;
                        result.textContent = value.toString();
                        latestPrize.textContent = `Latest prize: ${value}`;
                    }
                }

                const frame = () => {
                    if (!isSpinning) return;

                    if (angVel >= angVelMax) isAccelerating = false;

                    if (isAccelerating) {
                        angVel ||= angVelMin;
                        angVel *= 1.06;
                    } else {
                        isAccelerating = false;
                        angVel *= friction; 

                        if (angVel < angVelMin) {
                            isSpinning = false;
                            angVel = 0;
                            cancelAnimationFrame(animFrame);
                        }
                    }

                    ang += angVel; 
                    ang %= TAU; 
                    rotate();     
                };

                const engine = () => {
                    frame();
                    animFrame = requestAnimationFrame(engine);
                };

                elSpin.addEventListener("click", () => {
                    if (isSpinning) return;
                    isSpinning = true;
                    isAccelerating = true;
                    angVelMax = rand(0.25, 0.40);
                    engine();
                });

                function rand(m, M) {
                    return Math.random() * (M - m) + m;
                }

                const defaultPrizeValues = ['0 €', '50 €', '0 €', '50 €', '600 €', '0 €', '200 €']; // default prize
                numPrizes = defaultPrizeValues.length;

                const defaultPrizeElements = defaultPrizeValues.map(value => createPrizeElement(value));
                defaultPrizeElements.forEach(prizeElement => prizeMenu.appendChild(prizeElement));

                defaultPrizeValues.forEach((value, i) => {
                    drawSector(colors[i], value, i);
                });

                rotate();

                //add button mouse, keyboard
                const addPrizeButton = document.querySelector("#add-prize");
                const newPrizeInput = document.querySelector("#new-prize");

                newPrizeInput.addEventListener("keyup", (event) => {
                    if (event.key === "Enter") {
                        const newPrizeValue = newPrizeInput.value.trim();

                        if (newPrizeValue !== "") {
                            addPrizeToListAndWheel(newPrizeValue);
                            newPrizeInput.value = "";
                        }
                    }
                });

                addPrizeButton.addEventListener("click", () => {
                    const newPrizeValue = newPrizeInput.value.trim();

                    if (newPrizeValue !== "") {
                        addPrizeToListAndWheel(newPrizeValue);
                        newPrizeInput.value = "";
                    }
                });

            });
let candidats = [];

function addCandidat(val, name) {
    candidats.push({val: val, name: name});
}

addCandidat(0, "Иванов");
addCandidat(1, "Петров");
addCandidat(2, "Сидоров");
addCandidat(3, "Титов");

let sectionEl = document.getElementById("section");
let voteMatrix = {};
let selectedCandidats = {};

createSection("Выберите кандидатов на должность старосты группы из списка (для множественного выбора зажмите клавишу Ctrl):", selectCandidatsSection());

// конструктор для построения секции
function createSection(name, elList) {
    let nameEl = document.createElement("div");
    nameEl.textContent = name;
    let bodySectionEl = document.createElement("div");
    elList.forEach(el =>
        bodySectionEl.appendChild(el)
    )
    sectionEl.innerHTML = "";
    sectionEl.appendChild(nameEl);
    sectionEl.appendChild(bodySectionEl);
}

// окно для выбора кандидатов
function selectCandidatsSection() {
    let result = [];
    let selectList = document.createElement("select");
    selectList.setAttribute("multiple", "multiple");
    let buttonEl = document.createElement("button");
    buttonEl.textContent = "Далее";
    buttonEl.addEventListener("click", function () {
        let selectedOptions = getSelectValues(selectList);
        if (selectedOptions.length < 2) {
            alert("Нужно выбрать минимум двух кандидатов");
            return;
        }
        createSection("Проголосуйте (впишите последовательность порядковых номеров кандидатов, разделив из запятой):", voteCandidatsSection(selectedOptions));
    });

    for (let i = 0; i < candidats.length; i++) {
        let option = document.createElement("option");
        option.value = candidats[i].val;
        option.text = candidats[i].name;
        selectList.appendChild(option);
    }
    result.push(selectList);
    result.push(buttonEl);
    return result;
}

// окно для голосования за кандидатов
function voteCandidatsSection(selectedOptions) {
    let result = [];
    let olEl = document.createElement("ol");
    selectedOptions.forEach((id, index) => {
        let candidat = candidats.find(el => el.val === +id);
        let liEl = document.createElement("li");
        liEl.textContent = candidat.name;
        selectedCandidats[index] = candidat.name;
        olEl.appendChild(liEl);
    })
    let inputEl = document.createElement("input");

    let nextButtonEl = document.createElement("button");
    nextButtonEl.textContent = "Следующий";
    nextButtonEl.addEventListener("click", function () {
        addVote(inputEl.value);
        createSection("Проголосуйте (впишите последовательность порядковых номеров кандидатов, разделив из запятой):", voteCandidatsSection(selectedOptions));
    });

    let finishButtonEl = document.createElement("button");
    finishButtonEl.textContent = "Завершить";
    finishButtonEl.addEventListener("click", function () {
        addVote(inputEl.value);
        createSection("Матрица голосования:", showMatrixSection());
    });

    result.push(olEl);
    result.push(inputEl);
    result.push(nextButtonEl);
    result.push(finishButtonEl);
    return result;
}

// добавление голосования в матрицу
function addVote(val) {
    if (voteMatrix[val]) {
        voteMatrix[val] += 1;
    } else {
        voteMatrix[val] = 1
    }
}

// получение выбранных значений из мультиселекта
function getSelectValues(select) {
    let result = [];
    let options = select && select.options;
    let opt;

    for (let i = 0, iLen = options.length; i < iLen; i++) {
        opt = options[i];
        if (opt.selected) {
            result.push(opt.value || opt.text);
        }
    }
    return result;
}

// окно для вывода матрицы голосования и результатов коллекитвного выбора для разных моделей
function showMatrixSection() {
    let result = [];
    let matrixKeyArr = Object.keys(voteMatrix);
    let tableEl = document.createElement("table");
    for (let i = 0; i <= matrixKeyArr[0].split(',').length; i++) {
        let trEl = document.createElement("tr");
        for (let j = 0; j < matrixKeyArr.length; j++) {
            let tdEl = document.createElement("td");
            if (i === 0) {
                tdEl.textContent = voteMatrix[matrixKeyArr[j]];
            } else {
                let currentKeyArr = matrixKeyArr[j].split(',');
                let currentCandidatIndex = currentKeyArr[i - 1];
                tdEl.textContent = selectedCandidats[currentCandidatIndex - 1];
            }
            trEl.appendChild(tdEl);
        }
        tableEl.appendChild(trEl);
    }

    result.push(tableEl);
    let winnerNameElMajority = defineWinnerOfMajority();
    result.push(winnerNameElMajority);
    let winnerNameElCondorcet = defineWinnerOfCondorcet();
    result.push(winnerNameElCondorcet);
    let winnerNameElCoplend = defineWinnerOfCoplend();
    result.push(winnerNameElCoplend);
    let winnerNameElSimpson = defineWinnerOfSimpson();
    result.push(winnerNameElSimpson);
    let winnerNameElBord = defineWinnerOfBord();
    result.push(winnerNameElBord);
    return result;
}

// определение  побидетеля по модели большинства
function defineWinnerOfMajority() {
    let result = -1;
    let matrixKeyArr = Object.keys(voteMatrix);
    let candidatsArr = Object.keys(selectedCandidats);
    let sumArr = [];

    for (let i = 1; i < candidatsArr.length + 1; i++) {
        let sum = 0;
        let a = i + '';
        for (let j = 0; j < matrixKeyArr.length; j++) {
            let sequence = matrixKeyArr[j].split(',');
            if (sequence[0] == a) sum += voteMatrix[matrixKeyArr[j]];
        }
        sumArr.push(sum);
    }

    let maxEl = Math.max.apply(null, sumArr);
    let indexMaxEl = sumArr.findIndex(i => i == maxEl);
    sumArr[indexMaxEl] = 0;
    let sumRestArrEl = 0;
    for (let i = 0; i < sumArr.length; i++) {
        sumRestArrEl += +sumArr[i];
    }
    if (maxEl > sumRestArrEl) result = selectedCandidats[candidatsArr[indexMaxEl]];

    let winnerNameElMajority = document.createElement("div");
    if (result == -1) {
        winnerNameElMajority.textContent = "Победителя по модели большинства нет, так как ни один из кандидатов не набрал больше половины всех голосов";
    } else
        winnerNameElMajority.textContent = "Победитель по модели большинства: " + result + ", так как он набрал больше половины всех голосов";
    return winnerNameElMajority;
}

// определение явного побидетеля по модели Кондорсе
function defineWinnerOfCondorcet() {
    let result = -1;
    let matrixKeyArr = Object.keys(voteMatrix);
    let candidatsArr = Object.keys(selectedCandidats);

    for (let i = 1; i < candidatsArr.length + 1; i++) {
        let total = 0;
        for (let j = 1; j < candidatsArr.length + 1; j++) {
            let sum = 0;
            if (!(i == j)) {
                let x = i + '';
                let y = j + '';
                for (let k = 0; k < matrixKeyArr.length; k++) {
                    let sequence = matrixKeyArr[k].split(',');
                    let a = sequence.findIndex(i => i == x);
                    let b = sequence.findIndex(i => i == y);
                    if (a < b) sum += voteMatrix[matrixKeyArr[k]]
                    else sum -= voteMatrix[matrixKeyArr[k]];
                }
                if (sum > 0) total++;
            }
        }
        if (total == candidatsArr.length - 1) {
            result = selectedCandidats[candidatsArr[i-1]];
        }
    }

    let winnerNameElCondorcet = document.createElement("div");
    if (result == -1) {
        winnerNameElCondorcet.textContent = "Явного победителя по модели Кондорсе нет, так как ни один из кандидатов не победил всех остальных при попарном сравнении по правилу большинства";
    } else
    winnerNameElCondorcet.textContent = "Явный победитель по модели Кондорсе: " + result + ", так как он победил всех остальных кандидатов при попарном сравнении по правилу большинства";
    return winnerNameElCondorcet;
}

// определение побидетеля по модели Кондорсе с использованием правила Копленда
function defineWinnerOfCoplend() {
    let result = -1;
    let matrixKeyArr = Object.keys(voteMatrix);
    let candidatsArr = Object.keys(selectedCandidats);
    let totalArr = [];

    for (let i = 1; i < candidatsArr.length + 1; i++) {
        let total = 0;
        for (let j = 1; j < candidatsArr.length + 1; j++) {
            let sum = 0;
            if (!(i == j)) {
                let x = i + '';
                let y = j + '';
                for (let k = 0; k < matrixKeyArr.length; k++) {
                    let sequence = matrixKeyArr[k].split(',');
                    let a = sequence.findIndex(i => i == x);
                    let b = sequence.findIndex(i => i == y);
                    if (a < b) sum += voteMatrix[matrixKeyArr[k]]
                    else sum -= voteMatrix[matrixKeyArr[k]];
                }
                if (sum > 0) total++;
                if (sum < 0) total--;
            }
        }
        totalArr.push(total);
    }
    let maxEl = Math.max.apply(null, totalArr);
    let indexMaxEl = totalArr.findIndex(i => i == maxEl);
    result = selectedCandidats[candidatsArr[indexMaxEl]];
    totalArr[indexMaxEl] = 0;
    let maxEl2 = Math.max.apply(null, totalArr);
    if (maxEl == maxEl2) result = -1;

    let winnerNameElCoplend = document.createElement("div");
    if (result == -1) {
        winnerNameElCoplend.textContent = "Победителя по модели Кондорсе с учётом правила Копленда нет, так как более одного кандидата имеют одинаковую максимальную оценку Копленда";
    } else
        winnerNameElCoplend.textContent = "Победитель по модели Кондорсе с учётом правила Копленда: " + result + ", так как он имеют максимальную оценку Копленда, равную - " + maxEl;
    return winnerNameElCoplend;
}

// определение побидетеля по модели Кондорсе с использованием правила Симпсона
function defineWinnerOfSimpson() {
    let result = -1;
    let matrixKeyArr = Object.keys(voteMatrix);
    let candidatsArr = Object.keys(selectedCandidats);
    let totalArr = [];

    for (let i = 1; i < candidatsArr.length + 1; i++) {
        let total = 0;
        let sumArr = [];
        for (let j = 1; j < candidatsArr.length + 1; j++) {
            let sum = 0;
            if (!(i == j)) {
                let x = i + '';
                let y = j + '';
                for (let k = 0; k < matrixKeyArr.length; k++) {
                    let sequence = matrixKeyArr[k].split(',');
                    let a = sequence.findIndex(i => i == x);
                    let b = sequence.findIndex(i => i == y);
                    if (a < b) sum += voteMatrix[matrixKeyArr[k]];
                }
                sumArr.push(sum);
            }
        }
        total = Math.min.apply(null, sumArr);
        totalArr.push(total);
    }
    let maxEl = Math.max.apply(null, totalArr);
    let indexMaxEl = totalArr.findIndex(i => i == maxEl);
    result = selectedCandidats[candidatsArr[indexMaxEl]];
    totalArr[indexMaxEl] = 0;
    let maxEl2 = Math.max.apply(null, totalArr);
    if (maxEl == maxEl2) result = -1;

    let winnerNameElSimpson = document.createElement("div");
    if (result == -1) {
        winnerNameElSimpson.textContent = "Победителя по модели Кондорсе с учётом правила Симпсона нет, так как более одного кандидата имеют одинаковую максимальную оценку Симпсона";
    } else
        winnerNameElSimpson.textContent = "Победитель по модели Кондорсе с учётом правила Симпсона: " + result + ", так как он имеют максимальную оценку Симпсона, равную - " + maxEl;
    return winnerNameElSimpson;
}

// определение явного побидетеля по модели Борда
function defineWinnerOfBord() {
    let result = -1;
    let matrixKeyArr = Object.keys(voteMatrix);
    let candidatsArr = Object.keys(selectedCandidats);
    let sumArr = [];

    for (let i = 1; i < candidatsArr.length + 1; i++) {
        let sum = 0;
        let x = i + '';
        for (let j = 0; j < matrixKeyArr.length; j++) {
            let sequence = matrixKeyArr[j].split(',');
            let a = sequence.findIndex(i => i == x);
            sum += (matrixKeyArr.length - a)*voteMatrix[matrixKeyArr[j]];
        }
        sumArr.push(sum);
    }

    let maxEl = Math.max.apply(null, sumArr);
    let indexMaxEl = sumArr.findIndex(i => i == maxEl);
    result = selectedCandidats[candidatsArr[indexMaxEl]];
    sumArr[indexMaxEl] = 0;
    let maxEl2 = Math.max.apply(null, sumArr);
    if (maxEl == maxEl2) result = -1;

    let winnerNameElBord = document.createElement("div");
    if (result == -1) {
        winnerNameElBord.textContent = "Победителя по модели Борда нет, так как более одного кандидата набрали максимальное количестиво очков";
    } else
        winnerNameElBord.textContent = "Победитель по модели Борда: " + result + ", так как он набрал наибольшее количество очков, равное - " + maxEl;
    return winnerNameElBord;
}

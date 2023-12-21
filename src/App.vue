<template>
  <sTrain class="title-svg" />
  <button @click="toggleEditMode" class="modes svg-icon" :title="isEditMode ? viewHoverText : editHoverText">
    <sEdit v-if="!isEditMode" />
    <sView v-else />
  </button>
  <button @click="toggleDarkMode" class="dl-toggle svg-icon">
    <sLight v-if="!isDarkMode" />
    <sDark v-else />
  </button>
  <div class="subjects">
    <div class="subject" v-for="(subject, index) in subjects" :key="index">
      <div v-if="isEditMode">
        <button @click="deleteSubject(subject)" class="svg-icon bin">
          <sDelete />
        </button>
      </div>
      <h3 v-bind:contenteditable="isEditMode" ref="idContentEditable" :class="{ editable: isEditMode }"
        @blur="changeName(subject, $event)">
        {{ subject.name }}
      </h3>
      <div class="status">
        <div>
          <h2 v-if="!isEditMode" :class="kebabCase(subject.currentText)">{{ subject.currentText }}
          </h2>
          <div v-else>
            <button v-for="(text, textIndex) in texts" :key="textIndex" @click="changeText(subject, text)"
              :class="[{ selected: text === subject.currentText }, kebabCase(text)]">
              {{ text }}
            </button>
          </div>
        </div>
        <div class="rank">
          r.

          <!-- When not in edit mode, show the rank as text -->
          <span v-if="!isEditMode" :class="{ editable: isEditMode }">{{ subject.rank }}</span>
          <!-- When in edit mode, show an input field with the rank as its value -->
          <input v-else type="number" v-model="subject.rank" :class="{ editable: isEditMode, error: checkRanks(subject) }"
            min="1" max="99999">

          of

          <!-- When not in edit mode, show the rank as text -->
          <span v-if="!isEditMode" :class="{ editable: isEditMode }">{{ subject.total }}</span>
          <!-- When in edit mode, show an input field with the rank as its value -->
          <input v-else type="number" v-model="subject.total"
            :class="{ editable: isEditMode, error: checkRanks(subject) }" min="1" max="99999">
        </div>
      </div>

    </div>
  </div>
  <div v-if="isEditMode">
    <button @click="addSubject" class="svg-icon">
      <sAdd />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

// SVGs
import sEdit from './assets/icons/edit.svg';
import sView from './assets/icons/eye.svg';
import sAdd from './assets/icons/plus.svg';
import sDelete from './assets/icons/trash.svg';
import sLight from './assets/icons/sun.svg';
import sDark from './assets/icons/moon.svg';

import sTrain from './assets/train.svg';
import './Inter.ttf';

let isEditMode = ref(false);
const editHoverText = ref('Edit');
const viewHoverText = ref('View');

const idContentEditable = ref(null);
const texts = ref(['Optimal', 'Exceeding', 'On Track', 'Deviating', 'Veering', 'Derailing']); // Add more texts as needed
const subjects = ref([
  { name: 'Physics', currentText: 'Exceeding', rank: 1, total: 1 },
  { name: 'Maths', currentText: 'On Track', rank: 1, total: 1 },
  { name: 'Chemistry', currentText: 'Optimal', rank: 1, total: 1 },
  // Add more subjects as needed
]);

let history = ref([JSON.parse(JSON.stringify(subjects.value))]);
let future = ref<Subject[][]>([]);

type Subject = { name: string; currentText: string, rank: number, total: number };

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const changeText = (subject: Subject, newText: string) => {
  subject.currentText = newText;
};

const changeName = (subject: Subject, event: Event) => {
  if ((event.target as HTMLElement).textContent) {
    subject.name = (event.target as HTMLElement).textContent ?? '';
  }
  console.log(subjects);
};

const addSubject = () => {
  history.value.push(JSON.parse(JSON.stringify(subjects.value)));
  future.value = [];
  subjects.value.push({ name: 'New Subject', currentText: 'On Track', rank: 1, total: 1 });
};

const deleteSubject = (subject: Subject) => {
  history.value.push(JSON.parse(JSON.stringify(subjects.value)));
  future.value = [];
  const index = subjects.value.indexOf(subject);
  subjects.value.splice(index, 1);
};

const undo = () => {
  if (history.value.length > 1) {
    future.value.push(history.value.pop() as Subject[]);
    subjects.value = JSON.parse(JSON.stringify(history.value[history.value.length - 1]));
    console.log(future.value, history.value);
  }
};

const redo = () => {
  if (future.value.length > 0) {
    console.log(future.value, history.value);
    const nextState = future.value.pop();
    history.value.push(nextState);
    subjects.value = JSON.parse(JSON.stringify(nextState));
  }
};

let isDarkMode = ref(localStorage.getItem('darkMode') === 'true' || false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('darkMode', String(isDarkMode.value));
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};


const checkRanks = (subject: Subject) => {
  return subject.rank > subject.total;
};


// Save subjects to local storage whenever they change
watch(subjects, async () => {
  console.log('Saving subjects to local storage');
  localStorage.setItem('subjects', JSON.stringify(subjects.value));
}, { deep: true });

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  // Load subjects from local storage
  const savedSubjects = localStorage.getItem('subjects');
  if (savedSubjects) {
    subjects.value = JSON.parse(savedSubjects);
  }

  if (idContentEditable.value) {
    if (Array.isArray(idContentEditable.value)) {
      (idContentEditable.value as Array<HTMLElement>).forEach((element: HTMLElement) => {
        (element as HTMLElement).addEventListener('keydown', (evt) => {
          if (evt.key === 'Enter') {
            evt.preventDefault();
          }
        });
      });
    } else if (idContentEditable.value) {
      (idContentEditable.value as HTMLElement).addEventListener('keydown', (evt) => {
        if (evt.key === 'Enter') {
          evt.preventDefault();
        }
      });
    }
  }

  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }





});

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'z') {
    console.log('undo');
    undo();
  } else if (event.ctrlKey && (event.key === 'y' || (event.shiftKey && event.key === 'Z'))) {
    console.log('redo');
    redo();
  }
};


const kebabCase = (str: string) => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
};

</script>

<style>
@font-face {
  font-family: Inter;
  src: url(Inter.ttf);
}

.selected {
  font-weight: 800;
}

button {
  background-color: transparent;
}

.status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.rank {
  letter-spacing: 0.05rem;
  font-size: 2rem;
}

@media screen and (max-width: 600px) {
  .rank {
    font-size: 1.5rem;
  }
  .subjects input[type=number] {
    font-size: 1.5rem !important;
  }
}

.title-svg {
  width: 6rem;
}

.subjects {
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 1rem;
}

.subjects h3,
.subjects h2 {
  margin: 0;
}

.subjects h3 {
  font-size: max(20px, 2.5svw);
  font-weight: 800;
}

.subjects h2 {
  font-size: max(60px, 8svw);
  position: relative;
  font-weight: 900;
  left: -0.15rem;
  top: -1svw;
}

.subjects input[type=number] {
  width: 5rem;
  height: 2rem;
  font-size: 2rem;
  font-family: inherit;
  background-color: var(--contain);
  color: var(--on-contain);
  border: grey 1px solid;
  border-radius: 4px;
}

.modes {
  position: absolute;
  top: 2rem;
  right: 2rem;
}

.dl-toggle {
  position: absolute;
  top: 2rem;
  right: 5rem;
}

.svg-icon {
  border: 1px solid transparent;
  padding: 0.5rem;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: transparent;
  cursor: pointer;
  transition: scale 0.25s ease-in-out;
}

.svg-icon:hover {
  scale: 1.1;
}


.bin {
  color: red;
}

.error {
  border: 1px solid red !important;
  border-radius: 4px;
}

.svg-icon svg {
  width: 2rem;
  stroke: var(--on-background);

}

/* Statuses */
.optimal {
  color: var(--l1);
}

.exceeding {
  color: var(--l2);
}

.on-track {
  color: var(--l3);
}

.deviating {
  color: var(--l4);
}

.veering {
  color: var(--l5);
}

.derailing {
  color: var(--l6);
}

:root {
  background-color: var(--background);
  color: var(--on-background);
}

.editable {
  border: grey 1px solid;
  border-radius: 4px;
  background-color: var(--contain);
  color: var(--on-contain);
}

:root:not(.dark) {
  --background: #fdfdf5;
  --on-background: #1a1c18;
  --l1: #815500;
  --l2: #165c2a;
  --l3: #2d8536;
  --l4: #a3584f;
  --l5: #a35657;
  --l6: #7c2d2d;

  --contain: #ffdad5;
  --on-contain: #2c1512;

}

:root.dark {
  --background: #1a1c18;
  --on-background: #e3e3dc;
  --l1: #ffb779;
  --l2: #61ca6b;
  --l3: #8ed88b;
  --l4: #ffb4aa;
  --l5: #ca6865;
  --l6: #e45d54;

  --contain: #5d3f3b;
  --on-contain: #ffdad5;


}
</style>

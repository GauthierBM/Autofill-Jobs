<template>
    <div v-if='isOn' class="explanationBg">
        <div class="explanation">
            <div class="flex justify-between items-start mb-4">
                <h2 class="text-lg font-semibold text-gray-900">Information</h2>
                <svg style='cursor: pointer;' @click="toggleExplanation" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
            </div>
            <p class="text-gray-700 leading-relaxed">{{explanationContent}}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, watch } from 'vue';
import { useExplanation } from '@/composables/Explanation.ts';
export default {

    setup() {

        const { explanation, explanationContent, toggleExplanation, setExplanation } = useExplanation();

        const isOn = ref(false);
        const content = ref("");
        watch(explanation, (newVal) => {
            isOn.value = newVal;
        });
        watch(explanationContent, (newVal) => {
            content.value = newVal;
        });
        return {
            isOn, toggleExplanation, explanationContent
        };
    },
};
</script>
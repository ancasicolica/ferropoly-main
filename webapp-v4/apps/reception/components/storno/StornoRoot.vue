<!---
  This is the control for creating a storno booking
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 14.12.2025
-->

<template>
  <div class="card flex justify-center">
    <div v-if="gameplayStore.gameActive">
      <Stepper
          :value="stepperValue"
          linear
          class="basis-[50rem]"
      >
        <StepList>
          <Step value="1">Auswahl Team</Step>
          <Step value="2">Auswahl Ort</Step>
          <Step value="3">Bestätigung</Step>
          <Step value="4">Ausführung</Step>
        </StepList>
        <StepPanels>
          <StepPanel
              v-slot="{ activateCallback }"
              value="1"
          >
            <div class="flex flex-col h-48">
              <div class="font-medium">
                <p>Ein Ort falsch verkauft? Folge den Anweisungen hier um das Ort wieder freizugeben und die Buchungen
                  zu
                  stornieren. Dieser Vorgang kann nicht rückgängig gemacht werden, sei deshalb vorsichtig!
                </p>
                <p class="mt-4">Um welches Team handelt es sich?</p>
                <Select
                    v-model="selectedTeamId"
                    :options="teamsStore.teams"
                    option-label="name"
                    option-value="uuid"
                    fluid
                />

              </div>
            </div>
            <div class="flex pt-6 justify-end">
              <Button
                  label="Weiter"
                  :disabled="selectedTeamId === null"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  @click="activateCallback('2')"
              />
            </div>
          </StepPanel>
          <StepPanel
              v-slot="{ activateCallback }"
              value="2"
          >
            <div class="flex flex-col h-48">
              <div class="font-medium">
                <div v-if="!propertiesAvailable">
                  <p class="mt-8">Dieses Team hat bisher noch nichts gekauft - da kann man nichts rückgängig machen!</p>
                </div>
                <div v-if="propertiesAvailable">
                  <p>Welches Ort der Gruppe {{ teamsStore.idToTeamName(selectedTeamId) }} soll storniert werden?</p>
                  <div class="mt-4">
                    <Select
                        v-model="selectedPropertyId"
                        :options="propertyStore.propertiesByTeamId(selectedTeamId)"
                        option-label="location.name"
                        option-value="uuid"
                        fluid
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button
                  label="Zurück"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  @click="activateCallback('1')"
              />
              <Button
                  label="Weiter"
                  :disabled="selectedPropertyId === null"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  @click="activateCallback('3')"
              />
            </div>
          </StepPanel>
          <StepPanel
              v-slot="{ activateCallback }"
              value="3"
          >
            <div class="flex flex-col">
              <div class="font-medium">
                <p>Möchtest Du wirklich sämtliche Buchungen des Ortes "{{ selectedPropertyName }}", gehörend der Gruppe
                  "{{ teamsStore.idToTeamName(selectedTeamId) }}", stornieren?</p>
                <p class="mt-4">Diese Aktion kann NICHT rückgängig gemacht werden. Die beteiligten Teams werden über die
                  Korrekturbuchungen über diesen Schritt informiert.</p>
                <p class="mt-4">Damit Du nicht einfach durchclickst und möglicherweise die nächste Misere veranstaltest
                  -
                  bitte gib den Namen des Ortes, wie oben zwischen den Anführungszeichen angegeben, in das Textfeld
                  ein.</p>

                <InputText
                    v-model="checkText"
                    type="text"
                    fluid
                />
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button
                  label="Back"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  @click="activateCallback('2')"
              />
              <Button
                  label="Kauf stornieren"
                  :disabled="checkText !== selectedPropertyName"
                  icon="pi pi-check"
                  @click="runStorno"
              />
            </div>
          </StepPanel>
          <StepPanel
              v-slot="{ }"
              value="4"
          >
            <div class="flex flex-col">
              <div class="font-medium">
                <p class="mt-8"> {{ confirmationText }}</p>
              </div>
            </div>

          </StepPanel>
        </StepPanels>
      </Stepper>
    </div>
    <div v-else>
      <ferro-jumbotron
          title="Kein aktives Spiel"
          info="Orte können nur während dem Spiel storniert werden."
      />

    </div>
  </div>
</template>

<script setup>

import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import InputText from 'primevue/inputtext';

import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';
import Button from 'primevue/button';
import Select from 'primevue/select';
import {useTeamsStore} from '../../../../lib/store/TeamsStore';
import {computed, ref} from 'vue';
import {usePropertyStore} from '../../../../lib/store/PropertyStore';
import {useGameplayStore} from '../../../../lib/store/GameplayStore';
import FerroJumbotron from '../../../../lib/components/FerroJumbotron.vue';

const teamsStore    = useTeamsStore();
const propertyStore = usePropertyStore();
const gameplayStore = useGameplayStore();

const selectedTeamId     = ref(null);
const selectedPropertyId = ref(null);
const checkText          = ref('');
const stepperValue       = ref('1');
const confirmationText   = ref('');

const selectedPropertyName = computed(() => {
  return propertyStore.properties.get(selectedPropertyId.value)?.location.name;
})

const propertiesAvailable = computed(() => {
  return propertyStore.propertiesByTeamId(selectedTeamId.value).length > 0
})

const runStorno = function () {
  propertyStore.resetProperty(selectedTeamId.value, selectedPropertyId.value)
      .then((info) => {
        confirmationText.value = `Das Ort "${selectedPropertyName.value}" wurde wieder freigegeben. Total wurden ${info.transactionNb} Buchungen storniert.`
      })
      .catch(err => {
        confirmationText.value = `Leider lief da etwas grundsätzlich schief. Folgende Meldung kommt vom System: ${err.message}`;
        console.log('Bloody hell a problem while reseting a property', err);
      })
      .finally(() => {
        stepperValue.value = '4';
      });
}
</script>

<style scoped lang="scss">

</style>

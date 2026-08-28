import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const { getState, update } = await import('../assets/js/store.js');
const { toKey, today } = await import('../assets/js/cycle.js');
const calendar = (await import('../assets/js/screens/calendar.js')).default;

test('calendário mostra um coração e descrição acessível no dia com relação', () => {
  const key = toKey(today());
  update((state) => {
    state.profile.phase = 'tentante';
    state.logs[key] = { intercourse: true, protected: false };
  });

  const output = calendar.render();
  assert.match(output.html, /class="love"[^>]*>♥<\/i>/);
  assert.match(output.html, /relação registrada/);
  assert.equal(getState().logs[key].intercourse, true);
});

test('calendário pós-parto mostra status, vacina e consulta do bebê', () => {
  const key = toKey(today());
  update((state) => {
    state.profile.phase = 'posparto';
    state.babyStatus = [{
      id: `${key}:Lia`, babyName: 'Lia', recordedOn: key, weight: 5.2, height: 58,
      nextVaccineDate: key, nextVaccine: 'Pentavalente', nextAppointmentDate: key, nextAppointment: 'Pediatra',
    }];
  });

  const output = calendar.render();
  assert.match(output.appbar.title, /Calendário do bebê/);
  assert.match(output.html, /baby-status/);
  assert.match(output.html, /baby-care--vaccine/);
  assert.match(output.html, /baby-care--appointment/);
  assert.match(output.html, /Pentavalente · Lia/);
});

test('calendário gestacional mostra compromissos sem previsões do ciclo', () => {
  const key = toKey(today());
  update((state) => {
    state.profile.phase = 'gravida';
    state.calendarEvents = [{
      id: 'calendar:1', phase: 'gravida', type: 'ultrasound', title: 'Ultrassom morfológico', person: '',
      date: key, time: '10:00', recurrence: 'once', endDate: null, reminderDays: 1, notes: '',
    }];
  });

  const output = calendar.render();
  assert.equal(output.appbar.title, 'Calendário da gestação');
  assert.match(output.html, /planner-mark/);
  assert.match(output.html, /Ultrassom morfológico/);
  assert.doesNotMatch(output.html, /Previsão do próximo ciclo/);
});

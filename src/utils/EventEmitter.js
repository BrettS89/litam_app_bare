import _ from 'lodash';
import triggerAlarm from './triggerAlarm';
import { getIsoDate } from './date';
import { alarmsState } from '../redux/selectors';

class EventEmitter {
  constructor() {
    this.events = {
      // '08 00': [
      //   {
      //     _id: '001',
      //     days: ['Mon', 'Tue', 'Weds', 'Thu', 'Fri'],
      //     day: 'Sun',
      //     active:  true
      //     time: '08 00',
      //     displayTime: '8:00',
      //     ampm: 'AM',
      //   }
      // ],
    }
  }

  on(time, obj) {
    this.events[time] = this.events[time]
      ? [...this.events[time], obj]
      : [obj];
  }

  async emit(time) {
    const toDelete = {};
    const rang = [];
    const events = _.cloneDeep(this.events);
    const arr = events[time];
    // console.log(time);
    if (!arr) return;
    const today = new Date().toString().split(' ')[0];

    for (let a of arr) {
      if ((a.days.includes(today) || !a.days.length) && a.active) {
        if (!a.days.length) toDelete[a._id] = true;
        // run logic
        const didRing = await triggerAlarm(a);
        if (didRing) rang.push(a._id);
      }
    };

    let updatedAlarms = arr.filter(a => !toDelete[a._id]);
    updatedAlarms = arr.map(a => {
      if (rang.includes(a._id)) {
        return {
          ...a,
          rang: [getIsoDate()],
        }
      }
      return a;
    })
    events[time] = updatedAlarms;
    this.events = events;
  }

  clear() {
    this.events = {};
  }
}

export default new EventEmitter;

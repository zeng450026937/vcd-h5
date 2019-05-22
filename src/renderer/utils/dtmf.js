class DTMFAudio {
  constructor() {
    this.const_DTMF_row_frequency = [ 1209, 1336, 1477, 1633 ];
    this.const_DTMF_col_frequency = [ 697, 770, 852, 941 ];
    this.const_DTMF_key = [ '1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D' ];
    this.const_audio_sample_rate = 44100;
    this.const_sine_samples = 44100;

    this.var_Audio = null;
    this.var_DTMF_buffer = {};
    this.var_DTMF_mix_list = [];
    this.var_Precise_Tone_Plan_buffer = {};
    this.var_source = null;

    this.var_ko_dial_value = '250';
    this.var_ko_dial_delay = '250';

    this.var_ko_dial_value_pure = '250';
    this.var_ko_dial_delay_pure = '250';


    this.var_pure_DTMF_buffer = null;

    this.var_dial_isdialing = false;
    this.var_dial_interval = null;
    this.var_dial_time_rate = 40;
    this.var_dial_message = '';
    this.var_dial_message_index = 0;
    this.var_timeout_function = null;
  }

  init() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.var_Audio = new AudioContext();
    }
    catch (e) {
      console.warn('Web Audio API is not supported in this browser, We recommend You Download a Copy of Mozilla Firefox or Google Chrome!');
    }
    this.PopulateDTMFBuffer();
    this.PopulatePreciseTonePlan();
  }

  MakeDTMFSineBuffer(frequencyA, frequencyB) {
    const buffer = this.var_Audio.createBuffer(1, this.const_sine_samples, this.const_audio_sample_rate);

    const channel = buffer.getChannelData(0);

    for (let i = 0; i < this.const_sine_samples; ++i) {
      channel[i] = Math.sin(
        (frequencyA * 2 * Math.PI * i) / this.const_audio_sample_rate
      )
        + Math.sin((frequencyB * 2 * Math.PI * i) / this.const_audio_sample_rate);
    }

    return buffer;
  }


  PopulatePreciseTonePlan() {
    // Dial Tone
    this.var_Precise_Tone_Plan_buffer.dial = this.MakeDTMFSineBuffer(350, 440);

    // Ringback Tone 2x on 4x off
    let aux_samples = this.const_audio_sample_rate * 6;

    let buffer = this.var_Audio.createBuffer(1, aux_samples, this.const_audio_sample_rate);

    let channel = buffer.getChannelData(0);

    let buffer_index = 0; 

    let frequencyA = 440;

    let frequencyB = 480;

    let fade_array = [];

    let delay_as_sample = this.const_audio_sample_rate * 2;

    let fade_if_value = Math.floor(delay_as_sample * 0.10);


    for (let i = 0; i < delay_as_sample; i++) {
      if (i <= fade_if_value) {
        fade_array[i] = (1.0 / fade_if_value) * i;
      }
      else if (i >= delay_as_sample - fade_if_value - 1) {
        fade_array[i] = (1.0 / fade_if_value) * (delay_as_sample - (i + 1));
      }
      else {
        fade_array[i] = 1;
      }
    }


    for (let i = 0; i < aux_samples; ++i) {
      if (i < delay_as_sample) {
        channel[i] = fade_array[i] * Math.sin(
          (frequencyA * 2 * Math.PI * i) / this.const_audio_sample_rate
        )
          + fade_array[i] * Math.sin((frequencyB * 2 * Math.PI * i) / this.const_audio_sample_rate);
      }
      else {
        channel[i] = 0;
      }
    }
    this.var_Precise_Tone_Plan_buffer.ringback = buffer;


    // busy tone
    aux_samples = this.const_audio_sample_rate;
    buffer = this.var_Audio.createBuffer(1, aux_samples, this.const_audio_sample_rate);
    channel = buffer.getChannelData(0);
    buffer_index = 0;
    frequencyA = 480;
    frequencyB = 620;

    fade_array = [];

    delay_as_sample = Math.floor(this.const_audio_sample_rate * 0.5);

    fade_if_value = Math.floor(delay_as_sample * 0.10);


    for (let i = 0; i < delay_as_sample; i++) {
      if (i <= fade_if_value) {
        fade_array[i] = (1.0 / fade_if_value) * i;
      }
      else if (i >= delay_as_sample - fade_if_value - 1) {
        fade_array[i] = (1.0 / fade_if_value) * (delay_as_sample - (i + 1));
      }
      else {
        fade_array[i] = 1;
      }
    }


    for (let i = 0; i < aux_samples; ++i) {
      if (i < delay_as_sample) {
        channel[i] = fade_array[i] * Math.sin(
          (frequencyA * 2 * Math.PI * i) / this.const_audio_sample_rate
        )
          + fade_array[i] * Math.sin((frequencyB * 2 * Math.PI * i) / this.const_audio_sample_rate);
      }
      else {
        channel[i] = 0;
      }
    }
    this.var_Precise_Tone_Plan_buffer.busy = buffer;


    // reorder tone
    aux_samples = Math.floor(this.const_audio_sample_rate * 0.5);
    buffer = this.var_Audio.createBuffer(1, aux_samples, this.const_audio_sample_rate);
    channel = buffer.getChannelData(0);
    buffer_index = 0;
    frequencyA = 480;
    frequencyB = 620;

    fade_array = [];

    delay_as_sample = Math.floor(aux_samples * 0.5);

    fade_if_value = Math.floor(delay_as_sample * 0.10);


    for (let i = 0; i < delay_as_sample; i++) {
      if (i <= fade_if_value) {
        fade_array[i] = (1.0 / fade_if_value) * i;
      }
      else if (i >= delay_as_sample - fade_if_value - 1) {
        fade_array[i] = (1.0 / fade_if_value) * (delay_as_sample - (i + 1));
      }
      else {
        fade_array[i] = 1;
      }
    }


    for (let i = 0; i < aux_samples; ++i) {
      if (i < delay_as_sample) {
        channel[i] = fade_array[i]
          * Math.sin((frequencyA * 2 * Math.PI * i) / this.const_audio_sample_rate)
          + fade_array[i] * Math.sin((frequencyB * 2 * Math.PI * i) / this.const_audio_sample_rate);
      }
      else {
        channel[i] = 0;
      }
    }
    this.var_Precise_Tone_Plan_buffer.reorder = buffer;

    // off-hook tone
    aux_samples = Math.floor(this.const_audio_sample_rate * 0.2);
    buffer = this.var_Audio.createBuffer(1, aux_samples, this.const_audio_sample_rate);
    channel = buffer.getChannelData(0);
    buffer_index = 0;
    frequencyA = 1400;
    frequencyB = 2060;

    const frequencyC = 2450;

    const frequencyD = 2600;

    fade_array = [];

    delay_as_sample = Math.floor(aux_samples * 0.5);

    fade_if_value = Math.floor(delay_as_sample * 0.10);


    for (let i = 0; i < delay_as_sample; i++) {
      if (i <= fade_if_value) {
        fade_array[i] = (1.0 / fade_if_value) * i;
      }
      else if (i >= delay_as_sample - fade_if_value - 1) {
        fade_array[i] = (1.0 / fade_if_value) * (delay_as_sample - (i + 1));
      }
      else {
        fade_array[i] = 1;
      }
    }


    for (let i = 0; i < aux_samples; ++i) {
      if (i < delay_as_sample) {
        channel[i] = fade_array[i]
          * Math.sin((frequencyA * 2 * Math.PI * i) / this.const_audio_sample_rate)
          + fade_array[i] * Math.sin((frequencyB * 2 * Math.PI * i) / this.const_audio_sample_rate)
          + fade_array[i] * Math.sin((frequencyC * 2 * Math.PI * i) / this.const_audio_sample_rate)
          + fade_array[i] * Math.sin((frequencyD * 2 * Math.PI * i) / this.const_audio_sample_rate);
      }
      else {
        channel[i] = 0;
      }
    }
    this.var_Precise_Tone_Plan_buffer.howler = buffer;
  }

  PopulateDTMFBuffer() {
    let buffer_index = 0;

    for (let lc = 0; lc < this.const_DTMF_col_frequency.length; lc++) {
      for (let lr = 0; lr < this.const_DTMF_row_frequency.length; lr++) {
        const hash_key = this.const_DTMF_key[buffer_index];
        const frequencyA = this.const_DTMF_row_frequency[lr];
        const frequencyB = this.const_DTMF_col_frequency[lc];

        this.var_DTMF_buffer[hash_key] = this.MakeDTMFSineBuffer(frequencyA, frequencyB);
        this.var_DTMF_mix_list[hash_key] = [ frequencyA, frequencyB ];
        buffer_index += 1;
      }
    }
  }

  ko_DTMF_button_down(key, interval = 100) {
    this.stop_dial_interval();
    if (this.var_source != null) {
      this.var_source.stop(0);
      this.var_source = null;
    }

    this.var_source = this.var_Audio.createBufferSource();
    if (!this.var_source.start) {
      this.var_source.start = this.var_source.noteOn;
    }
    if (!this.var_source.stop) {
      this.var_source.stop = this.var_source.noteOff;
    }
    this.var_source.loop = true;
    this.var_source.connect(this.var_Audio.destination);

    this.var_source.buffer = this.var_DTMF_buffer[key];
    this.var_source.start(0);
    if (interval !== 0) {
      setTimeout(this.stop_pure_dial.bind(this), interval);
    }
  }

  ko_DTMF_button_up() {
    if (this.var_source != null) {
      this.var_source.stop(0);
    }
  }

  stop_dial_interval() {
    if (this.var_dial_isdialing === true) {
      window.clearInterval(this.var_dial_interval);
      this.var_dial_interval = null;
      if (this.var_source != null) {
        this.var_source.stop(0);
        this.var_source = null;
      }
      this.var_dial_isdialing = false;
    }
    this.var_dial_message = '';
    this.var_dial_message_index = 0;
  }

  stop_pure_dial() {
    this.stop_dial_interval();
    if (this.var_source != null) {
      this.var_source.stop(0);
      this.var_source = null;
    }
  }

  ko_precise_tones(key) {
    if (!(key in this.var_Precise_Tone_Plan_buffer)) {
      console.warn(`Precise Tone has no : ${key}`);

      return;
    }
    this.stop_dial_interval();
    if (this.var_source != null) {
      this.var_source.stop(0);
      this.var_source = null;
    }

    this.var_source = this.var_Audio.createBufferSource();
    if (!this.var_source.start) {
      this.var_source.start = this.var_source.noteOn;
    }
    if (!this.var_source.stop) {
      this.var_source.stop = this.var_source.noteOff;
    }

    this.var_source.loop = true;
    this.var_source.connect(this.var_Audio.destination);

    const buffer = this.var_Precise_Tone_Plan_buffer[key];

    this.var_source.buffer = buffer;
    this.var_source.start(0);
  }

  ko_DTMF_Dial_pure() {
    this.stop_dial_interval();

    let dtmf_number = this.var_ko_dial_value_pure();

    dtmf_number = dtmf_number.replace(/-/g, '');
    dtmf_number = dtmf_number.replace(/\(/g, '');
    dtmf_number = dtmf_number.replace(/\)/g, '');
    dtmf_number = dtmf_number.replace(/ /g, '');

    if (dtmf_number == null || dtmf_number === '') {
      console.warn('No DTMF Number Provided');

      return;
    }

    for (let i = 0; i < dtmf_number.length; i++) {
      const value = dtmf_number[i];

      if (!(value in this.var_DTMF_buffer)) {
        console.warn(`DTMF Has No Number:${value}`);

        return;
      }
    }

    let delay = Math.parseInt(this.var_ko_dial_delay_pure());

    if (Number.isNaN(delay)) {
      delay = 250;
    }

    const delay_as_sec = delay * 0.001;

    const delay_as_sample = Math.floor(delay_as_sec * this.const_sine_samples);

    const total_samples = delay_as_sample * dtmf_number.length;

    const buffer = this.var_Audio.createBuffer(1, total_samples, this.const_audio_sample_rate);

    const channel = buffer.getChannelData(0);

    let buffer_index = 0;


    const fade_array = [];

    const fade_if_value = Math.floor(delay_as_sample * 0.25);

    for (let i = 0; i < delay_as_sample; i++) {
      if (i <= fade_if_value) {
        fade_array[i] = (1.0 / fade_if_value) * i;
      }
      else if (i >= delay_as_sample - fade_if_value - 1) {
        fade_array[i] = (1.0 / fade_if_value) * (delay_as_sample - (i + 1));
      }
      else {
        fade_array[i] = 1;
      }
    }


    for (let lp = 0; lp < dtmf_number.length; lp++) {
      const value = dtmf_number[lp];
      const freqs = this.var_DTMF_mix_list[value];

      const frequencyA = freqs[0];

      const frequencyB = freqs[1];

      for (let i = 0; i < delay_as_sample; ++i) {
        channel[buffer_index] = fade_array[i]
          * Math.sin((frequencyA * 2 * Math.PI * i) / this.const_audio_sample_rate)
          + fade_array[i] * Math.sin((frequencyB * 2 * Math.PI * i) / this.const_audio_sample_rate);
        buffer_index += 1;
      }
    }


    this.var_pure_DTMF_buffer = buffer;


    if (this.var_source != null) {
      this.var_source.stop(0);
      this.var_source = null;
    }

    this.var_source = this.var_Audio.createBufferSource();
    if (!this.var_source.start) {
      this.var_source.start = this.var_source.noteOn;
    }
    if (!this.var_source.stop) {
      this.var_source.stop = this.var_source.noteOff;
    }

    this.var_source.connect(this.var_Audio.destination);

    this.var_source.buffer = this.var_pure_DTMF_buffer;
    this.var_source.start(0);
  }


  ko_DTMF_Dial() {
    this.stop_dial_interval();
    this.var_dial_message = '';
    this.var_dial_message_index = 0;

    let dtmf_number = this.var_ko_dial_value();

    dtmf_number = dtmf_number.replace(/-/g, '');
    dtmf_number = dtmf_number.replace(/\(/g, '');
    dtmf_number = dtmf_number.replace(/\)/g, '');
    dtmf_number = dtmf_number.replace(/ /g, '');

    if (dtmf_number == null || dtmf_number === '') {
      console.warn('No DTMF Number Provided');

      return;
    }
    for (let i = 0; i < dtmf_number.length; i++) {
      const value = dtmf_number[i];

      if (!(value in this.var_DTMF_buffer)) {
        console.warn(`DTMF Has No Number:${value}`);

        return;
      }
    }
    this.var_dial_message = dtmf_number;
    this.var_dial_message_index = 0;
    this.var_dial_isdialing = true;
    this.DTMF_Interval();
  }
}


DTMFAudio.prototype.DTMF_Interval = function() {
  let delay = Math.parseInt(this.var_ko_dial_delay());

  if (Number.isNaN(delay)) {
    delay = 250;
  }
  this.var_dial_interval = setInterval(this.DTMF_time_dial.bind(this), delay);
};

DTMFAudio.prototype.DTMF_time_dial = function() {
  if (this.var_dial_message_index !== 0) {
    if (this.var_dial_message_index >= this.var_dial_message.length) {
      this.stop_dial_interval();
      
      return;
    }
  }
  const number = this.var_dial_message[this.var_dial_message_index];

  this.var_dial_message_index = this.var_dial_message_index + 1;

  if (this.var_source != null) {
    this.var_source.stop(0);
    this.var_source = null;
  }

  this.var_source = this.var_Audio.createBufferSource();
  if (!this.var_source.start) {
    this.var_source.start = this.var_source.noteOn;
  }
  if (!this.var_source.stop) {
    this.var_source.stop = this.var_source.noteOff;
  }

  this.var_source.loop = true;
  this.var_source.connect(this.var_Audio.destination);

  this.var_source.buffer = this.var_DTMF_buffer[number];
  this.var_source.start(0);
};

const DTMF = new DTMFAudio();

DTMF.init();

export default DTMF;

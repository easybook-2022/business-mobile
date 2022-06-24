import i18n from 'i18n-js';
import { english } from './languages/english'
import { vietnamese } from './languages/vietnamese'
import { chinese } from './languages/chinese'
import { french } from './languages/french'

i18n.translations = {
  english, vietnamese, chinese, french
};

export const tr = i18n

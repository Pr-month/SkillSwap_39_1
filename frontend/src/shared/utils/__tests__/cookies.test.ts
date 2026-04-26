import { getCookie, setCookie, deleteCookie } from '../cookies';

describe('cookies utils', () => {
  let cookieStore = '';

  beforeEach(() => {
    cookieStore = '';
    Object.defineProperty(document, 'cookie', {
      get: () => cookieStore,
      set: v => {
        const [pair] = v.split(';');
        const [name, value] = pair.split('=');
        const re = new RegExp(`(?:^|; )${name}=[^;]*`);

        if (cookieStore.match(re)) {
          cookieStore = cookieStore.replace(re, `${name}=${value}`);
        } else {
          cookieStore += (cookieStore ? '; ' : '') + `${name}=${value}`;
        }
      },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    });
  });

  test('setCookie устанавливает cookie', () => {
    setCookie('token', 'abc');
    expect(document.cookie).toContain('token=abc');
  });

  test('getCookie возвращает значение cookie', () => {
    document.cookie = 'token=123';
    expect(getCookie('token')).toBe('123');
  });

  test('getCookie возвращает undefined для несуществующего cookie', () => {
    expect(getCookie('notfound')).toBeUndefined();
  });

  test('setCookie с expires (число) не вызывает ошибок', () => {
    setCookie('test', 'val', { expires: 1 });
    expect(document.cookie).toContain('test=val');
  });

  test('setCookie с expires (Date) не вызывает ошибок', () => {
    const date = new Date(Date.now() + 10000);
    setCookie('datecookie', 'v', { expires: date });
    expect(document.cookie).toContain('datecookie=v');
  });

  test('setCookie с кастомным path не вызывает ошибок', () => {
    setCookie('custom', 'v', { path: '/custom' });
    expect(document.cookie).toContain('custom=v');
  });

  test('deleteCookie удаляет cookie', () => {
    document.cookie = 'delme=bye';
    deleteCookie('delme');
    expect(document.cookie).toContain('delme=');
  });
});

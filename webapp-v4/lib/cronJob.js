/**
 * Functions for the cron job
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 18.01.2026
 **/

const cronjobTypeToText = function (type){
  switch (type) {
    case 'interest':
      return 'Zins & Startgeld';
    case 'prestart' :
      return 'Vorbereitung Spielstart';
    case 'start':
      return 'Spielstart';
    case 'end':
      return 'Spielende';
    case 'summary':
      return 'Freigabe Spieldaten an Teams';
    default:
      return type;
  }
}

export {cronjobTypeToText}

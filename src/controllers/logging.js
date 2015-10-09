import Logs from '../collections/logs';
import errorMessage from '../utils/error';

export default function(req, res) {
    new Logs().fetch().then((log) => {
        res.send(log);
    }).catch((err) => {
        console.log(`Error fetching logs: '${err}'.`);
        res.send(errorMessage());
    });
};

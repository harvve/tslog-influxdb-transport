# tslog-influxdb-transport
> Send logs to influxdb2 via telegraf without writing them to files.

<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#installation">Installation</a></li>
    <li>
      <a href="#usage">Usage</a>
      <ol>
        <li><a href="#settings">Settings</a></li>
      </ol>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>
<br>

## About The Project

This library provides a transporter to configure and send logs from tslog via telegraph directly to [InfluxDB2](https://docs.influxdata.com/influxdb/v2.5/). This allows you to aggregate the logs in one place in this case in InfluxDB2. The stored log data can be [visualized](https://docs.influxdata.com/influxdb/v2.5/visualize-data/) and [alerts](https://docs.influxdata.com/influxdb/v2.5/monitor-alert/) can be set up in the InfluxDB2 UI with the built-in Chronograf and Kapacitor tools.

### Installation

```sh
npm i @harvve/tslog-influxdb-transport
```

## Usage
Attach transport provider to tslog instance.
```typescript
import { Logger } from 'tslog';
import { Transporter } from '@harvve/tslog-influxdb-transport';

const transporter = new Transporter({
  address: 'localhost',
  port: 3123,
  socketType: 'udp4',
  measurementName: 'myLoggerLogs',
  minLevel: 'info'
});

const logger: Logger = new Logger({
  name: 'myLogger',
  attachedTransports: [this.transporter.getTransportProvider()]
});

logger.info('Hello!');
```

_Check out working example --> [View Demo](https://github.com/harvve/tslog-influxdb-transport-demo)_


### Settings
All possible settings are defined in the ITransporterOptions interface and modern IDEs will provide auto-completion accordingly.

* **port** - `number` - Destination port (port on which the telegraf listens)
* **address** - `string` - Destination host name or IP address
* **socketType** - `udp4 | udp6` - Type of socket
* **measurementName** - `string` - Name of measurement (in influxdb2 bucket)
* **minLevel** - `TLogLevelName` - Minimum logging level to transport - default 'debug'
* **fieldKeys** - `Array` - List of field keys - If no keys are provided, the default ones will be used
* **tagKeys** - `Array` - List of tag keys - with string value only - If keys are not specified, default ones will be used

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.


<!-- CONTACT -->
## Contact

Project Link: [https://github.com/harvve/tslog-influxdb-transport](https://github.com/harvve/tslog-influxdb-transport)


<!-- ACKNOWLEDGMENTS -->
## Acknowledgments
* [tslog docs](https://tslog.js.org/#/)
* [InfluxDB2 docs](https://docs.influxdata.com/influxdb/v2.5/)
* [Telegraf docs](https://docs.influxdata.com/telegraf/v1.24/)
* [node.js dgram](https://nodejs.org/api/dgram.html#class-dgramsocket)



<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/harvve/tslog-influxdb-transport.svg?style=for-the-badge
[contributors-url]: https://github.com/harvve/tslog-influxdb-transport/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/harvve/tslog-influxdb-transport.svg?style=for-the-badge
[forks-url]: https://github.com/harvve/tslog-influxdb-transport/network/members
[stars-shield]: https://img.shields.io/github/stars/harvve/tslog-influxdb-transport.svg?style=for-the-badge
[stars-url]: https://github.com/harvve/tslog-influxdb-transport/stargazers
[issues-shield]: https://img.shields.io/github/issues/harvve/tslog-influxdb-transport.svg?style=for-the-badge
[issues-url]: https://github.com/harvve/tslog-influxdb-transport/issues
[license-shield]: https://img.shields.io/github/license/harvve/tslog-influxdb-transport.svg?style=for-the-badge
[license-url]: https://github.com/harvve/tslog-influxdb-transport/blob/main/LICENSE.txt

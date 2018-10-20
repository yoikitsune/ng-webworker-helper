export class {{ name }} extends WorkerService {
{{#each properties }}
  {{ this.name }} : {{ this.type }};

{{/each}}
  constructor() {
    super ("./assets/chesstools-worker.js");
  {{#each properties }}
    this.{{ this.name }} = new {{ this.type }}(this);
  {{/each}}
  }

{{#each methods }}
  {{ this.name }} ({{ this.header }}) {
      return this.get ({{ this.body }}, "this");
  }
{{/each}}
}

{{#each workerClasses}}
export class {{ this.name }} extends WorkerClass {
  {{#each methods}}
  {{ this.name }} ({{ this.header }}) {
    return this.service.get ({{ this.body }}, "{{ this.propertyName }}");
  }
  {{/each}}
}
{{/each}}

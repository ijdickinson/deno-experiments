import parse from 'https://deno.land/x/date_fns@v2.22.1/parse/index.js'

/**
 * Goal: read a file of texttual data, and generate a JSON file that
 * encodes the data in a more regular form.
 */

interface SightingsData {
  species: string
  quant?: string
  location: string
  date: string
  time?: string
  spotter: string
}

const LINE_MATCHER = /(?<species>[^\(]*)(\(x(?<quant>[0-9]+)\))? - (?<location>[^0-9]*)( at (?<time>.*))? on (?<date>.*) by (?<spotter>.*)/

async function readLines(source: string) {
  const sourceData = await Deno.readTextFile(source)
  return sourceData.trim().split('\n')
}

function parseLine(line: string): SightingsData | undefined {
  return line.match(LINE_MATCHER)?.groups as (SightingsData | undefined)
}

function asData(data: SightingsData) {
  return {
    species: data.species.trim(),
    quantity: parseInt(data.quant || '1'),
    location: data.location.trim(),
    spotter: data.spotter.trim(),
    date: parse(data.date, 'd LLLL yyyy', new Date(), {}),
    time: data.time
  }
}

readLines('./sightings-data.txt')
  .then(async lines => {
    const sightingsJson = lines.map(line => {
      const data = parseLine(line)
      return data ? asData(data) : `Unparsed: ${line}`
    })

    await Deno.writeTextFile(
      './sightings-data.json',
      JSON.stringify(sightingsJson, null, 2)
    )

    console.log('Success.')
  })

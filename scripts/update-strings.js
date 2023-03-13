const fs = require('fs')
const axios = require('axios')
const { parse } = require('csv-parse/sync');

const DST_FILE = "lang/en.json"
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSEwBVQdcdZ5FKaAqtYJA5zrtDUijGY-HFb7tpWT3KwOb9ISdru1hOXaAcNgyn55xc4dg0ykdnH2XTZ/pub?gid=0&single=true&output=csv"

const main = async () => {

  const resp = await axios.get(CSV_URL)
  const j = parse(resp.data, {from: 2})
    .reduce(
      (ac, row) => {
        if (row[0] in ac) {
          console.error(`Duplcate key ${row[0]}`)
        }
        ac[row[0]] = row[1]
        return ac
      },
      {}
    )
  fs.writeFileSync(DST_FILE, JSON.stringify(j));
  console.log(`written to ${DST_FILE}`)
}

main()

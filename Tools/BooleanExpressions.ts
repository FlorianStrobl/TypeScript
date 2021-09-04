export class BooleanExp {
  public bool: boolean;

  // add <,>,>=,<=,== as feature TODO

  // () ! && || true false
  constructor(booleanExpression: string) {
    this.bool = this.getBool(booleanExpression);

    return this;
  }

  private getBool(boolExp: string): boolean {
    boolExp = boolExp.replace(/ /g, (s) => ''); // remove unwanted spaces
    // check for invalid characters
    if (!boolExp.match(/^(true|false|\(|\)|!|&&|\|\|)+$/))
      throw new Error('Invalid symbol used.');

    boolExp = removeSimpleNots(boolExp);

    let res: string[][] = [];
    for (let db of getDeepestBrakets(boolExp)) // get all the deepest ()
      res.push([db, evaluateBoolWithoutBrakets(db.slice(1, -1))]); // evaluate them
    for (let r of res) boolExp = boolExp.replace(r[0], () => r[1]); // save them

    boolExp = removeSimpleNots(boolExp);

    if (!boolExp.includes('(')) boolExp = evaluateBoolWithoutBrakets(boolExp);

    // recursion if still () else finish
    if (boolExp.includes('(')) return this.getBool(boolExp);
    else {
      if (boolExp === 'true') return true;
      else if (boolExp === 'false') return false;
      else throw new Error('Error happend during conversion: ' + boolExp);
    }

    function removeSimpleNots(str: string): string {
      // replace !true => false, !false => true (without () check)
      return str.replace(/!(true|false)/g, (b) =>
        b.includes('true') ? 'false' : 'true'
      );
    }

    function evaluateBoolWithoutBrakets(str: string): string {
      // symbols: ! true false && ||

      str = removeSimpleNots(str);

      if (str.includes('&&') && str.includes('||')) {
        // get all the &&, evaluate them and then get do the simple ||
        let ands: string[] = str
          .split('||')
          .map((s) => evaluateBoolWithoutBrakets(s));
        return ands.includes('true') ? 'true' : 'false';
      } else if (str.includes('&&') && !str.includes('||'))
        return removeSimpleNots(str).includes('false') ? 'false' : 'true';
      else if (!str.includes('&&') && str.includes('||'))
        return removeSimpleNots(str).includes('true') ? 'true' : 'false';
      else return removeSimpleNots(str); // finish
    }
  }
}

function getDeepestBrakets(str: string): string[] {
  let write: boolean = false;
  let curVal: string = '';
  let vals: string[] = [];

  for (let b of str) {
    if (b === '(') {
      write = true;
      curVal = '';
    } else if (b === ')' && write) {
      write = false;
      vals.push(curVal + ')');
      curVal = '';
    }

    if (write) curVal += b;
  }

  return vals;
}

console.log(new BooleanExp("true || false"));
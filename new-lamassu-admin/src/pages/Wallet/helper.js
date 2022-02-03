import * as R from 'ramda'
import * as Yup from 'yup'

import {
  Autocomplete,
  Checkbox,
  NumberInput
} from 'src/components/inputs/formik'
import { disabledColor } from 'src/styling/variables'
import { CURRENCY_MAX } from 'src/utils/constants'
import { transformNumber } from 'src/utils/number'

const classes = {
  editDisabled: {
    color: disabledColor
  }
}
const filterClass = type => R.filter(it => it.class === type)
const filterCoins = ({ id }) => R.filter(it => R.contains(id)(it.cryptos))

const WalletSchema = Yup.object().shape({
  ticker: Yup.string().required(),
  wallet: Yup.string().required(),
  exchange: Yup.string().required(),
  zeroConf: Yup.string().required(),
  zeroConfLimit: Yup.number()
    .integer()
    .required('Zero Conf Limit is a required field')
    .min(0)
    .max(CURRENCY_MAX)
    .transform(transformNumber)
})

const AdvancedWalletSchema = Yup.object().shape({
  cryptoUnits: Yup.string().required(),
  allowTransactionBatching: Yup.boolean().required()
})

const getAdvancedWalletElements = (cryptoCurrencies, coinUtils, config) => {
  const viewCryptoCurrency = it =>
    R.compose(
      R.prop(['display']),
      R.find(R.propEq('code', it))
    )(cryptoCurrencies)

  const getOptions = R.curry((coinUtils, it) => {
    const options = R.keys(coinUtils.getCryptoCurrency(it.id).units)
    return R.map(option => {
      return { code: option, display: option }
    })(options)
  })

  return [
    {
      name: 'id',
      header: 'Cryptocurrency',
      width: 180,
      view: viewCryptoCurrency,
      size: 'sm',
      editable: false
    },
    {
      name: 'cryptoUnits',
      size: 'sm',
      stripe: true,
      width: 190,
      input: Autocomplete,
      inputProps: {
        options: getOptions(coinUtils),
        valueProp: 'code',
        labelProp: 'display'
      }
    },
    {
      name: 'allowTransactionBatching',
      size: 'sm',
      stripe: true,
      width: 250,
      view: (_, ite) => {
        if (ite.id !== 'BTC')
          return <span style={classes.editDisabled}>{`No`}</span>
        return config[`${ite.id}_allowTransactionBatching`] ? 'Yes' : 'No'
      },
      input: Checkbox,
      editable: it => it.id === 'BTC'
    }
  ]
}

const getElements = (cryptoCurrencies, accounts, onChange, wizard = false) => {
  const widthAdjust = wizard ? 11 : 0
  const viewCryptoCurrency = it => {
    const currencyDisplay = R.compose(
      R.prop(['display']),
      R.find(R.propEq('code', it))
    )(cryptoCurrencies)
    return currencyDisplay
  }
  const filterOptions = type => filterClass(type)(accounts || [])

  const getDisplayName = type => it =>
    R.compose(
      R.prop('display'),
      R.find(R.propEq('code', it))
    )(filterOptions(type))

  const getOptions = R.curry((option, it) =>
    filterCoins(it)(filterOptions(option))
  )

  return [
    {
      name: 'id',
      header: 'Cryptocurrency',
      width: 150 - widthAdjust,
      view: viewCryptoCurrency,
      size: 'sm',
      editable: false
    },
    {
      name: 'ticker',
      size: 'sm',
      stripe: true,
      view: getDisplayName('ticker'),
      width: 175 - widthAdjust,
      input: Autocomplete,
      inputProps: {
        options: getOptions('ticker'),
        valueProp: 'code',
        labelProp: 'display',
        optionsLimit: null
      }
    },
    {
      name: 'wallet',
      size: 'sm',
      stripe: true,
      view: getDisplayName('wallet'),
      width: 175 - widthAdjust,
      input: Autocomplete,
      inputProps: {
        options: getOptions('wallet'),
        valueProp: 'code',
        labelProp: 'display',
        optionsLimit: null,
        onChange
      }
    },
    {
      name: 'exchange',
      size: 'sm',
      stripe: true,
      view: getDisplayName('exchange'),
      width: 175 - widthAdjust,
      input: Autocomplete,
      inputProps: {
        options: getOptions('exchange'),
        valueProp: 'code',
        labelProp: 'display',
        optionsLimit: null,
        onChange
      }
    },
    {
      name: 'zeroConf',
      header: 'Confidence Checking',
      size: 'sm',
      stripe: true,
      view: getDisplayName('zeroConf'),
      input: Autocomplete,
      width: 210 - widthAdjust,
      inputProps: {
        options: getOptions('zeroConf'),
        valueProp: 'code',
        labelProp: 'display',
        optionsLimit: null,
        onChange
      }
    },
    {
      name: 'zeroConfLimit',
      header: '0-conf Limit',
      size: 'sm',
      stripe: true,
      view: (it, row) =>
        row.id === 'ETH' ? <span style={classes.editDisabled}>{it}</span> : it,
      input: NumberInput,
      width: 145 - widthAdjust,
      inputProps: {
        decimalPlaces: 0
      },
      editable: row => row.id !== 'ETH'
    }
  ]
}

export {
  WalletSchema,
  AdvancedWalletSchema,
  getElements,
  filterClass,
  getAdvancedWalletElements
}

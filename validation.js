const Joi = require('@hapi/joi')
var split = require('string-split');

const isHex = (h) =>{
    var re = /[0-9A-Fa-f]{6}/g;
  
    return (!re.test(h)&&h.length!=24)
}


function sentenceCase(input, lowercaseBefore) {
    input = ( input === undefined || input === null ) ? '' : input;
    if (lowercaseBefore) { input = input.toLowerCase(); }
    return input.toString().replace( /(^|\. *)([a-z])/g, function(match, separator, char) {
        return separator + char.toUpperCase();
    });
  }
  
  function breakLine(str){
    return str.replace( /\n/g, function(match, separator, char) {
      
      return "\\n\\n";
    });
  }
  
  function makeSplit(str) {
    return split(/(.*[a-z])(?=[A-Z])/,str);
  }
  
  const toTextArea = (str) => {
    return breakLine(sentenceCase(str))
  }
  
  const toTitle = (str) =>{
    return sentenceCase(str)
  }

  const getDate = (date) =>{
    date = split("/",date).reverse().join("-");
    if(date!="")
    {
        var d =new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    }else{
     
        var d =new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    }

        return [year, month, day].join('-')
  }


const registerValidation = (data) =>{

    const schema =Joi.object({
        name: Joi.string().min(6).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    })

    return schema.validate(data)
}

const loginValidation = (data) =>{

    const schema =Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    })

    return schema.validate(data)
}



module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
module.exports.isHex = isHex
module.exports.toTextArea = toTextArea
module.exports.toTitle = toTitle
module.exports.getDate = getDate
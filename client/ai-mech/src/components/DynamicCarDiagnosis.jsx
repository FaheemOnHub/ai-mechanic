// import React from "react";
// import { TriangleAlert } from "lucide-react";
// const DynamicCarDiagnosis = ({ diagnosisText }) => {
//   const parseDiagnosis = (text) => {
//     const sections = text
//       .split("###")
//       .filter((section) => section.trim() != "");

//     return sections.map((section) => {
//       const [title, ...content] = section
//         .split("\n")
//         .filter((line) => line.trim() !== "");
//       return {
//         title: title.trim(),
//         content: content.join("\n").trim(),
//       };
//     });
//   };

//   const renderBoldText = (content) => {
//     const parts = content.split(/(\*\*.*?\*\*)/);
//     return parts.map((mess, index) => {
//       if (mess.startsWith("**") && mess.endsWith("**")) {
//         return <strong key={index}>{mess.slice(2, -2)}</strong>;
//       }
//       return mess; // incase it fails to enter the if stmt
//     });
//   };

//   const renderListItems = (content) => {
//     return content
//       .split("-")
//       .filter((item) => item.trim() !== "")
//       .map((item, index) => (
//         <li key={index} className="mb-1">
//           {renderBoldText(item.trim())}
//         </li>
//       ));
//   };

//   const parseSection = parseDiagnosis(diagnosisText);
//   return (
//     <div>
//       {parseSection.map((section, index) => {
//         return (
//           <div key={index} className="mb-6">
//             <h2 className="text-xl font-semibold mb-2">
//               {renderBoldText(section.title)}
//             </h2>
//             {section.title.toLowerCase().includes("conclusion") ? (
//               <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
//                 <div className="flex items-center">
//                   <TriangleAlert className="text-yellow-500 mr-2" />
//                   <p className="font-semibold">Conclusion</p>
//                 </div>
//                 <p className="text-gray-700 mt-2">
//                   {renderBoldText(section.content)}
//                 </p>
//               </div>
//             ) : (
//               <div className="text-gray-700">
//                 {section.content.includes("-") ? (
//                   <ul className="list-disc pl-5">
//                     {renderListItems(section.content)}
//                   </ul>
//                 ) : (
//                   <p>{renderBoldText(section.content)}</p>
//                 )}
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default DynamicCarDiagnosis;

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DynamicCarDiagnosis = ({ diagnosisText }) => {
  const parseDiagnosis = (text) => {
    const sections = text
      .split("###")
      .filter((section) => section.trim() !== "");
    return sections.map((section) => {
      const [title, ...content] = section
        .split("\n")
        .filter((line) => line.trim() !== "");
      return { title: title.trim(), content: content.join("\n").trim() };
    });
  };

  const renderBoldText = (content) => {
    const parts = content.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderListItems = (content) => {
    return content
      .split("-")
      .filter((item) => item.trim() !== "")
      .map((item, index) => (
        <li key={index} className="mb-1">
          {renderBoldText(item.trim())}
        </li>
      ));
  };

  const parsedSections = parseDiagnosis(diagnosisText);

  return (
    <div className="space-y-6">
      {parsedSections.map((section, index) => (
        <div key={index}>
          <h2 className="text-xl font-semibold mb-2">
            {renderBoldText(section.title)}
          </h2>
          {section.title.toLowerCase().includes("conclusion") ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Conclusion</AlertTitle>
              <AlertDescription>
                {renderBoldText(section.content)}
              </AlertDescription>
            </Alert>
          ) : (
            <div>
              {section.content.includes("-") ? (
                <ul className="list-disc pl-5 space-y-1">
                  {renderListItems(section.content)}
                </ul>
              ) : (
                <p>{renderBoldText(section.content)}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DynamicCarDiagnosis;

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import working from "../assets/working.png";
import { Link } from "react-router-dom";
const HowitWorks = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="mx-auto text-2xl">
            How Our AI-Powered Vehicle Mechanic App Works!
          </CardTitle>
          <Card>
            <img
              src={working}
              alt=""
              className="rounded-lg flex justify-center items-center"
            />
          </Card>
          <CardContent>
            <Card className="p-3">
              <p className="font-bold text-xl">Introduction:</p>
              <p className="font-serif">
                Our AI-powered vehicle mechanic app is designed to assist users
                in diagnosing vehicle issues quickly and effectively. Whether
                it's an OBD code or a vague problem description, our app uses
                artificial intelligence to provide accurate diagnoses and
                step-by-step solutions. Let's dive into the technical workings
                that enable this app to deliver precise results to its users.
              </p>
            </Card>

            <br />
            <Card className="p-3">
              <p className="font-bold">Step 1:Understanding User Input</p>
              <p className="font-serif">
                Users can either: Enter OBD Codes: These codes are specific to
                vehicles and help pinpoint particular issues.
                <br /> Describe the Issue: Users can enter details about the
                problem, like unusual noises or symptoms they've noticed. This
                flexibility ensures that our app can work even if users do not
                have an OBD code at hand.
              </p>
            </Card>

            <br />
            <Card className="p-3">
              <p className="font-bold text-blue-600">
                <Link
                  to="https://medium.com/@serkan_ozal/vector-similarity-search-53ed42b951d9#:~:text=Cosine%20Similarity%20Basis:%20The%20Dot%20Product"
                  target="blank"
                >
                  Step 2:Semantic Understanding Using AI (Cosine Similarity
                  Search)
                </Link>
              </p>
              <p className="font-serif">
                Once the user submits their input, the backend processes it
                using an advanced semantic search mechanism: The app leverages
                an embedding model from OpenAI that converts the user's natural
                language description into a vector format. This enables us to
                understand the context and meaning behind the user's words,
                rather than just keyword matching. We maintain a dataset of OBD
                codes along with their corresponding descriptions and common
                solutions, also represented in vector format. The semantic
                search finds the closest match between the user's input and the
                existing database, allowing for a contextually relevant and
                accurate diagnosis. For instance, if the user says, "My engine
                makes a rattling noise when accelerating," the AI can match this
                with potential causes that fit the description based on the
                knowledge base.
              </p>
            </Card>

            <br />
            <Card className="p-3">
              <p className="font-bold">Step 3:AI Asking Follow-Up Questions</p>
              <p className="font-serif">
                To enhance accuracy, our app also includes a feature where the
                AI asks follow-up questions to gather more information: If the
                initial input lacks sufficient details, the AI generates
                clarifying questions to fill in the gaps. For example, if a user
                mentions an issue with the engine but doesn't specify when it
                occurs, the AI may ask: "Does this issue happen when the vehicle
                is cold or after driving for a while?" The answers to these
                follow-up questions are used to further refine the diagnosis,
                leading to more accurate suggestions.
              </p>
            </Card>

            <br />
            <Card className="p-3">
              <p className="font-bold">Ensuring Accuracy</p>
              <p className="font-serif">
                The app delivers accurate results by using: Advanced AI
                Embeddings: Using the embedding model ensures the AI can
                interpret and match vehicle problems effectively, even if the
                language used is non-technical. Semantic Search: Rather than a
                simple keyword search, semantic search matches the meaning
                behind words, ensuring that results are contextually accurate.
                Continuous Learning: The system learns from user interactions,
                allowing for ongoing improvements in providing relevant
                questions and suggestions.
              </p>
            </Card>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default HowitWorks;
